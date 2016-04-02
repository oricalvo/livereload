import {Component} from "../fx/Component";

export class ContactListComponent extends Component {
    contacts: Contact[]

    constructor() {
        super();
    }

    getButtonText(contact) {
        return "14";
    }
}

export interface Contact {
    id: number;
    name: string;
}

Component.registerComponent({
    name: "contact-list",
    controller: ContactListComponent,
    template: require("./contactList.html!text"),
    styles: require("./contactList.css!css"),
    scope: {
        contacts: "<"
    }
});
