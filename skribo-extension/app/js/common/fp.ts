class fp {
    public static maybe(object: any): any {

        if (!object)
            return {};
        return object;
    }



    public static maybeJson(object: any): string {
        if (!object)
            return '{}';
        return JSON.parse(object);
    }

    public static maybeString(object: any): string {
        if (!object)
            return '';
        return object;
    }


    public static if(condition: any, trueaction?: Function, falseaction?: Function): any {
        if (condition && trueaction)
            return trueaction(condition);
        else if (!condition && falseaction)
            return falseaction(condition);
        else if (falseaction)
            falseaction(condition);
    }


    public static ensure(object: Object, property: string | string[], defaultValue?: any) {
        if (Array.isArray(property)) {
            (property as string[]).map((prop) => {
                if (!object[prop])
                    object[prop] = defaultValue || null;
            });
        }
        else {
            if (!object[property])
                object[property] = defaultValue || null;
        }

    }



}