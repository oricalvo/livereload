import IModule = angular.IModule;

var $q: ng.IQService;

export class ModuleLoader {
    private loader: IModuleLoader;
    private index: ModuleIndex;
    private executingModules: Module[];
    private postReloadActions: Function[];

    constructor(loader: IModuleLoader) {
        this.loader = loader;
        this.index = null;
        this.executingModules = [];
        this.postReloadActions = [];
    }

    reload(index: ModuleIndex) {
        if(this.index == null) {
            this.index = index;
            return;
        }

        var changes: ModuleIndex = this.index.getChanges(index);
        var changedModules: Module[] = changes.getAll();
        var names: string[] = changedModules.map(m => m.name);

        this.loader.clear(names);

        return this.loader.load(names).then(()=> {
            this.index = this.index.merge(changes);

            let actions = [].concat(this.postReloadActions);
            this.postReloadActions = [];

            for(var action of actions) {
                action();
            }
        });
    }

    registerPostReloadAction(func: Function) {
        this.postReloadActions.push(func);
    }
}

export class ModuleIndex {
    private modules: any;

    constructor(modules?: Module[]) {
        this.modules = {};

        if(modules) {
            for (let module of modules) {
                this.add(module);
            }
        }
    }

    getAll() : Module[] {
        var modules: Module[] = [];

        for(let name in this.modules) {
            let module = this.modules[name];

            modules.push(module);
        }

        return modules;
    }

    add(module: Module) {
        this.modules[module.name] = module;
    }

    clone() {
        let index = new ModuleIndex();

        for(let name in this.modules) {
            let module = this.modules[name];

            index.add(module);
        }

        return index;
    }

    merge(index: ModuleIndex) {
        var res: ModuleIndex = this.clone();

        for(let name in index.modules) {
            let module = index.modules[name];

            this.modules[name] = module;
        }

        return res;
    }

    getChanges(index: ModuleIndex) {
        var changes: Module[] = [];

        for(let name in index.modules) {
            let module = index.modules[name];
            let existing = this.modules[name];

            if(!existing || module.hash != existing.hash) {
                changes.push(module);
                continue;
            }
        }

        let res = new ModuleIndex(changes);
        return res;
    }
}

export interface Module {
    name: string;
    hash: string;
}

export interface IModuleLoader {
    clear(names: string[]);
    load(names: string[]): ng.IPromise<Module[]>;
}

export class ModuleLoaderOnSystemJS implements IModuleLoader {
    clear(names: string[]) {
    }
        
    load(names: string[]): ng.IPromise<Module[]> {
        return $q.when([]); 
    }
}
