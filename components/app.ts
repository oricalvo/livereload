/// <reference path="../typings/globals.d.ts" />

import {Component} from "../fx/Component";
import {ContactListComponent, Contact} from "./contactList"; PREVENT_IMPORT_REMOVE(ContactListComponent);

declare var System;
declare var SystemJSCacheBuster;

export class AppComponent extends Component {
    message: string;
    contacts: Contact[];

    constructor() {
        super();

        this.message = "XXX";

        this.contacts = [
            {id:1, name: "Ori"},
            {id:2, name: "Roni"},
            {id:3, name: "Udi"},
        ];
    }

    load() {
        SystemJSCacheBuster.checkHashFile();

        // System.import("/components/contactList2").then(()=> {
        //     console.log("LOADED");
        // }).catch((err)=> {
        //     console.log("ERROR: " + err.message);
        // });
    }
}

Component.registerComponent({
    name: "app",
    controller: AppComponent,
    template: require("./app.html!text"),
    styles: require("./app.css!css"),
});
