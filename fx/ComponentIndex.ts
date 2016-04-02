import {RegisterComponentOptions, Component} from "./Component";
import {ComponentType} from "./ComponentType";

export class ComponentIndex {
    private componentTypes: any;
    private components: any;
    private pendingRegister: RegisterComponentOptions[];

    constructor() {
        this.componentTypes = {};
        this.components = {};
        this.pendingRegister = [];
    }

    private createComponentType(options: RegisterComponentOptions) {
        var componentType = new ComponentType(options.name, options);

        this.componentTypes[options.name] = componentType;

        return componentType;
    }

    add(componentType: ComponentType) {
        if(this.componentTypes[componentType.getName()]) {
            throw new Error("ComponentType: " + componentType.getName() + " already exists");
        }

        this.componentTypes[componentType.getName()] = componentType;
    }

    findComponentTypeByName(name: string) {
        let componentType: ComponentType = this.componentTypes[name];
        return componentType;
    }

    onComponentCreated(component: Component) {
        this.components[component.getId()] = component;

        component.getType().onComponentCreated(component);
    }

    onComponentDestroyed(component: Component) {
        component.getType().onComponentDestroyed(component);

        delete this.components[component.getId()];
    }
}
