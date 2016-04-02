/// <reference path="tsd.d.ts" />

declare var L;

//
//  Typescript removes import when that import is not being used
//  We can use the simple 'import "XXX"' syntax but in this case typescript does not check if the file exist
//  So our solution is to use 
//  import * as XXX from "./XXX";
//  PREVENT_IMPORT_REMOVE(x)
//
declare function PREVENT_IMPORT_REMOVE(x);
