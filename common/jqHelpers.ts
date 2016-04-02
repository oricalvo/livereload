export function getSingleNode(element: JQuery): Element {
    if(!element.length) {
        throw new Error("JQuery element is empty");
    }

    var res = element[0];
    return res;
}
