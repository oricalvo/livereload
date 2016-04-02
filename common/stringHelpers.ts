/// <reference path="../typings/tsd.d.ts" />

export function camelCaseToSnakeCase(str: string): string {
    var arr = [];

    for(var i=0; i<str.length; i++) {
        var ch = str[i];

        if(isUpper(ch)) {
            arr.push("-" + ch.toLowerCase());
        }
        else {
            arr.push(ch);
        }
    }

    var res = arr.join("");
    return res;
}

export function snakeCaseToCamelCase(str: string): string {
    var arr = [];

    for(var i=0; i<str.length; i++) {
        var ch = str[i];
        var nextCh = str[i+1];

        if(ch=="-") {
            arr.push(nextCh.toUpperCase());
            i++;
        }
        else {
            arr.push(ch);
        }
    }

    var res = arr.join("");
    return res;
}

export function isUpper(str: string): boolean {
    var res = str.toUpperCase() == str;
    return res;
}

export function padLeft(str, size, ch) {
    var buffer = [];

    for(var i=0; i<size-str.length; i++) {
        buffer.push(ch);
    }

    buffer.push(str);

    let res = buffer.join("");
    return res;
}
