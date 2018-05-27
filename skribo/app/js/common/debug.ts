class debug {
    debugName: string;
    constructor(debugName: string) {
        this.debugName = debugName;

    }
    public log(message) {
        if (fp.maybeString(window['JUNTAS_DEBUG']).indexOf(this.debugName)> -1) {
            console.log(message);
        }
    }
}