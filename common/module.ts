/// <reference path="../typings/tsd.d.ts" />

import "angular";

var deps = [
];
var bootstrapped = false;

export var module = angular.module("ngLiveReload", deps);

export function bootstrap() {
    var element = document.getElementById("html");
    if(!element) {
        console.error("Root element was not found");
        return;
    }

    angular.bootstrap(element, [module.name]);

    bootstrapped = true;
}

export function isBootstrapped() {
    return bootstrapped;
}
