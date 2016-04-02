import {module} from "../common/module";
import {RegisterComponentOptions, Component} from "./Component";
import * as stringHelpers from "../common/stringHelpers";

var $compile: any = null;
var $rootScope: any = null;

export class ComponentType {
    private name: string;
    private options: RegisterComponentOptions;
    private components: any;
    
    constructor(name: string, options: RegisterComponentOptions) {
        this.name = name;
        this.options = options;
        this.components = {};
    }

    getName() {
        return this.name;
    }
    
    onComponentCreated(component: Component) {
        this.components[component.getId()] = component;
    }

    onComponentDestroyed(component: Component) {
        delete this.components[component.getId()];
    }
    
    registerAsDirective() {
        var directiveName = stringHelpers.snakeCaseToCamelCase(this.options.name);
        module.directive(directiveName, function ($injector) {
            return {
                restrict: "E",
                controller: () => {
                    var ctor:any = this.options.controller;
                    return $injector.instantiate(ctor);
                },
                transclude: !!this.options.transclude,
                link: (scope, element, attrs) => {
                    Component.postLink(this, scope, element, attrs);
                },
                controllerAs: "ctrl",
                template: () => {
                    return this.options.template;
                },
                bindToController: true,
                scope: this.options.scope || {}
            };
        });
    }
    
    reload(options: RegisterComponentOptions) {
        var recreate = [];
        
        for(var componentId in this.components) {
            var component = this.components[componentId];
        
            recreate.push({
                parentScope: component.scope.$parent,
                element: component.element,
            });
        
            component.destroy();
        }

        this.options = options;

        for(var item of recreate) {
            $compile(item.element)(item.parentScope);
        }
        
        $rootScope.$apply();
    }
}

run.$inject = ["$rootScope", "$compile"];
function run(_$rootScope, _$compile) {
    $rootScope = _$rootScope;
    $compile = _$compile;
}

module.run(run);
