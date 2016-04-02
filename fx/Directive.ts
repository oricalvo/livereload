export interface RegisterDirectiveOptions {
    name: string;
    compile?: (element, attr)=>{};
    directive: any,
}

export class Directive {
    protected scope;
    protected element;
    protected attrs;

    static stack: Directive[] = [];

    constructor(scope, element, attrs) {
        this.scope = scope;
        this.element = element;
        this.attrs = attrs;
    }

    static compile(options: RegisterDirectiveOptions, element, attrs) {
        return {
            pre: function(scope, element, attrs) {
                Directive.preLink(options, scope, element, attrs);
            },
            post: function(scope, element, attrs) {
                Directive.postLink(options, scope, element, attrs);
            }
        };
    }

    static preLink(options: RegisterDirectiveOptions, scope, element, attrs) {
        var directive = new options.directive(scope, element, attrs);
        Directive.stack.push(directive);

        directive.onPreLink();
    }

    static postLink(options: RegisterDirectiveOptions, scope, element, attrs) {
        Directive.current().onPostLink();

        Directive.stack.pop();
    }

    static current() {
        var stack = Directive.stack;
        if(!stack.length) {
            throw new Error("No current directive");
        }

        var dir = stack[stack.length-1];
        return dir;
    }

    onPreLink() {
        this.log("onPreLink");
    }

    onPostLink() {
        this.log("onPostLink");
    }

    private log(message, ... args: any[]) {
        args.unshift(this.getTypeName() + ": " + message)

        console.log.apply(console, args);
    }

    protected getTypeName() {
        var me: any = this;

        return me.constructor.name;
    }
}
