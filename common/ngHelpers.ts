/// <reference path="../typings/tsd.d.ts" />

import {module} from "./module";
import {Component} from "../fx/Component";

var logDigests = false;
var logIterations = false;
var logWatchCount = true;

module.run($rootScope => {
    var iterationCount;

    var Scope = $rootScope.constructor;
    if(Scope) {
        var originalDigest = Scope.prototype.$digest;
        Scope.prototype.$digest = function() {
            if(logDigests) {
                console.log("$digest BEGIN");
            }

            if(logWatchCount) {
                console.log("$watch COUNT: " + $rootScope.$$watchersCount);
            }

            iterationCount = 0;
            
            originalDigest.apply(this, arguments);

            if(logDigests) {
                console.log("$digest END");
            }
        }
    }

    $rootScope.$watch(function() {
        if(logIterations) {
            console.log("ITERATION: " + (++iterationCount));
        }
    });
});
