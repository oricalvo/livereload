declare var SystemJS;

var executingModules = [];

patchSystemJS();

function getExecutingModule() {
    if(!executingModules.length) {
        throw new Error("No executing module");
    }

    return executingModules[executingModules.length-1];
}

function preModuleExecute(load) {
    console.log("preModuleExecute: " + load.name);

    executingModules.push({
        name: load.name,
    });
}

function postModuleExecute(load) {
    console.log("postModuleExecute: " + load.name);

    executingModules.pop();
}

function patchSystemJS() {
    var SystemJSProto = SystemJS.constructor.prototype;
    var originalInstantiate = SystemJSProto.instantiate;
    SystemJSProto.instantiate = function (load) {
        var res = originalInstantiate.call(this, load);

        var entry = load.metadata.entry;
        var originalExecute = entry.execute;
        entry.execute = function (originalRequire, exports, module) {
            function newRequire(dep) {
                console.log("require: " + dep);

                return originalRequire.apply(this, arguments);
            }

            // for (var key in entry.normalizedDeps) {
            //     console.log("  " + entry.normalizedDeps[key]);
            // }

            preModuleExecute(load);

            var res = originalExecute.call(this, newRequire, exports, module);

            postModuleExecute(load);

            return res;
        }

        return res;
    }
}

