System.config({
    baseURL: "/",
    defaultJSExtensions: true,
    transpiler: false,
    buildCSS: false,

    meta: {
        "angular": {
            "format": "global",
            "exports": "angular",
            "deps": [
                "jquery",
            ]
        },
    },

    map: {
        "angular": "lib/angular.js",
        "jquery": "lib/jquery.js",
        "css": "lib/systemjs/css.js",
        "text": "lib/systemjs/text.js",
    }
});
