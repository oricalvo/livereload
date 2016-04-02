/// <reference path="../typings/globals.d.ts" />

import {module} from "../common/module";
import {EventEmitterSource} from "../fx/EventEmitter";
import * as StringHelpers from "../common/stringHelpers";
import {Directive, RegisterDirectiveOptions} from "../fx/Directive";
import {Component, RegisterComponentOptions} from "../fx/Component";
import * as ngHelpers from "../common/ngHelpers"; PREVENT_IMPORT_REMOVE(ngHelpers);

var injector;

export interface RegisterServiceOptions {
    name: string;
    service: Function;
}

export function registerService(options: RegisterServiceOptions) {
    module.service(options.name, options.service);
}

export function registerDirective(options: RegisterDirectiveOptions) {
    var directiveName = StringHelpers.snakeCaseToCamelCase(options.name);
    module.directive(directiveName, function($injector) {
        var ddo = {
            restrict: "A",
            compile: function(element, attrs) {
                return Directive.compile(options, element, attrs);
            }
        };

        return ddo;
    });
}

export var events: EventEmitterSource = new EventEmitterSource("APPEVENTS");

function config() {
}

function run($injector, $rootScope) {
    injector = $injector;
}

module.config(config);

module.run(run);
