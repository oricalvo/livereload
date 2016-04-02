import {module} from "../common/module";
import {EventEmitter, EventEmitterSource} from "./EventEmitter";
import * as stringHelpers from "../common/stringHelpers";
import {ComponentType} from "./ComponentType";
import {ComponentIndex} from "./ComponentIndex";
import {IModuleLoader, ModuleLoader, ModuleLoaderOnSystemJS} from "./ModuleLoader";

var $rootScope: any = null;
var $timeout: any = null;
var $injector: any = null;
var $compile: any = null;

export class Component {
    events: EventEmitter;

    private static componentTypes: any = {};
    private static nextId: number = 1;

    protected id: number;
    protected injector: any;
    protected options: RegisterComponentOptions;
    protected scope: ng.IScope;
    protected element: JQuery;
    protected attrs: JQuery;
    protected eventsSource: EventEmitterSource;
    protected inputs: string[];
    protected type: ComponentType;

    public static index: ComponentIndex = new ComponentIndex();
    public static loader: ModuleLoader = new ModuleLoader(new ModuleLoaderOnSystemJS());

    constructor() {
        this.id = ++Component.nextId;
        this.injector = null;
        this.scope = null;
        this.element = null;
        this.inputs = null;
        this.eventsSource = new EventEmitterSource(this.getComponentTypeName());
        this.events = new EventEmitter(this.eventsSource);
    }

    onInit() {
        Component.onComponentCreated(this);

        this.log("onInit");

        this.watchInputs();
    }

    onDestroy() {
        Component.onComponentDestroyed(this);

        this.log("onDestroy");
    }

    internalOnPush(newValue, oldValue) {
        if(newValue && newValue.length==1) {
            newValue = newValue[0];
        }

        if(oldValue && oldValue.length==1) {
            oldValue = oldValue[0];
        }

        this.log("onPushed %O ==> %O", oldValue, newValue);

        this.onPushed();
    }

    onPushed() {
    }

    destroy() {
        if(this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }

        if(this.element) {
            this.element.empty();
            this.element = null;
        }
    }

    getElement() {
        return this.element;
    }

    getParent() : Component {
        var scope: any = this.scope.$parent;
        if(!scope) {
            return null;
        }

        while(scope) {
            if(scope.hasOwnProperty("ctrl")) {
                var parent = scope.ctrl;
                if(parent) {
                    return parent;
                }
            }

            scope = scope.$parent;
        }

        return null;
    }
    
    getClosestParent<T>(type: new (...args: any[]) => T) : T {
        var rootScope = this.injector.get("$rootScope");

        var scope: any = this.scope.$parent;
        while(true) {
            if(scope.ctrl && (scope.ctrl instanceof type)) {
                return scope.ctrl;
            }

            scope = scope.$parent;

            if(scope == rootScope) {
                break;
            }
        }

        throw Error("No parent component of type: " + (<any>type).name + " was found");
    }

    log(message, ... args: any[]) {
        if(message.substring(0, 2)!="  ") {
            message = this.getComponentTypeName(true) + ": " + message;
        }

        args.unshift(message);

        console.log.apply(console, args);
    }

    static onComponentCreated(component: Component) {
        console.log("onComponentCreated: %O", component);

        var componentType = Component.componentTypes[component.options.name];
        componentType.components[component.id] = component;
    }

    static onComponentDestroyed(component: Component) {
        console.log("onComponentDestroyed: %O", component);

        var componentType = Component.componentTypes[component.options.name];
        delete componentType.components[component.id];
    }

    static dumpAllComponents() {
        for(var componentTypeName in Component.componentTypes) {
            var componentType = Component.componentTypes[componentTypeName];
            console.log(componentTypeName);

            var components = componentType.components;

            for(var componentId in components) {
                var component = components[componentId];
                console.log("    " + componentId + ": %O", component);
            }
        }
    }
    
    static registerComponent(options: RegisterComponentOptions) {
        let componentType: ComponentType = Component.index.findComponentTypeByName(options.name);
        if(!componentType) {
            componentType = new ComponentType(options.name, options);
            Component.index.add(componentType);
        }
        else {
            Component.loader.registerPostReloadAction(()=> {
                componentType.reload(options);
            });
        }
    }

    createComponent(componentName: string): Component {
        var parentScope: any = this.scope;
        var template = "<" + componentName + "></" + componentName + ">";
        var element = $(template);
        var oldChildScope = parentScope.$$childTail;
        var linkFn = $compile(element);

        linkFn(parentScope);

        var componentScope = parentScope.$$childTail;
        if (oldChildScope == componentScope) {
            throw new Error("DOM compilation is broken. No injected component scope was found");
        }

        var component = componentScope.ctrl;
        if (!component) {
            throw new Error("DOM compilation is broken. A new scope was created but attached ctrl was not found");
        }

        return component;
    }
    
    getId(): number {
        return this.id;
    }
    
    getType(): ComponentType {
        return this.type;
    }

    static postLink(options, scope, element, attrs) {
        var ctrl: any = scope.ctrl;

        if(!(ctrl instanceof Component)) {
            throw new Error("Component: " + (<any>(ctrl.constructor)).name + " does not extend Component");
        }

        if(ctrl) {
            ctrl.injector = $injector;
            ctrl.scope = scope;
            ctrl.element = element;
            ctrl.attrs = attrs;
            ctrl.inputs = [];
            ctrl.options = options;

            for(var key in options.scope) {
                if(options.scope[key] == "<") {
                    ctrl.inputs.push(key);
                }
            }

            if(ctrl.onInit) {
                ctrl.onInit();
            }

            if(ctrl.onDestroy) {
                scope.$on("$destroy", function() {
                    ctrl.onDestroy();
                });
            }
        }
    }

    static generateId() {
        var res = "componentId" + Component.nextId++;
        return res;
    }

    static invokeOnVmTurnEnd(method: Function) {
        if($rootScope == null) {
            throw new Error("Component.$rootScope is not available yet");
        }

        $rootScope.$$postDigest(method);
    }

    static invokeOnNextVmTurn(method: Function) {
        if($timeout == null) {
            throw new Error("Component.$timeout is not available yet");
        }

        $timeout(method);
    }

    protected getComponentTypeName(removeComponentSuffix?: boolean) {
        var me: any = this;

        var name = me.constructor.name;

        var fix = (removeComponentSuffix===undefined ? false : removeComponentSuffix);
        var end = name.length-"Component".length;
        if(fix && name.indexOf("Component")==end) {
            name = name.substring(0, end);
        }

        return name;
    }

    protected ensureInitialized() {
        if(this.scope == null) {
            throw new Error("Component " + this.getComponentTypeName() + " is not initialized");
        }
    }

    private watchInputs() {
        if(this.inputs.length) {
            var inputs = [];

            this.scope.$watchCollection(()=> {
                inputs.splice(0, inputs.length);

                this.inputs.forEach(input=> {
                    inputs.push(this[input]);
                });

                return inputs;
            }, (newValue, oldValue)=> {
                this.internalOnPush(newValue, oldValue);
            });
        }
    }
}

export interface RegisterComponentOptions {
    name: string;
    controller: Function;
    template: string;
    scope?: any;
    styles: string;
    transclude?: boolean;
}

(<any>window).dumpComponents = Component.dumpAllComponents;

run.$inject = ["$injector", "$rootScope", "$timeout", "$compile"];
function run(_$injector, _$rootScope, _$timeout, _$compile) {
    $injector = _$injector;
    $rootScope = _$rootScope;
    $timeout = _$timeout;
    $compile = _$compile;
}

module.run(run);
