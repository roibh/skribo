function scripter(obj?: any) {


    if (typeof (obj) != 'undefined') {
        var scope = new scripterScope();
        if (typeof (obj) == 'string') {
            scope.selectorObj = document.querySelectorAll(obj);
        }
        else {
            if (obj.length !== undefined) { scope.selectorObj = obj; }
            else {
                scope.selectorObj = [];
                scope.selectorObj[0] = obj;
            }
        }
        return scope;
    }
    else {
        return new scripterScope();
    }


}

class scripterScope {
    constructor() {


    }

    public selectorObj: any;
    public single() {
        
        return this.selectorObj[0];
    }
    public toList() {
        return this.selectorObj;
    }

    public offset(): any {

        var rect = this.selectorObj[0].getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        }

    }

    public outerWidth(): number {
        this.selectorObj.forEach((el: any) => {
            return el.offsetWidth;
        });
        return 0;
    }

    public outerHeight(): number {
        this.selectorObj.forEach((el: any) => {
            return el.offsetHeight;
        });

        return 0;
    }


    public remove() {
        this.selectorObj.forEach((item: any) => {
            item.parentNode.removeChild(item);
        });

    }
    public append(html: string) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            if (typeof (html) == 'object') {
            }
            else {
                this.selectorObj[i].innerHTML += html;
            }
        }
        return this;
    }

    public prepend(html: string) {
        for (var i = 0; i < this.selectorObj.length; i++)
            this.selectorObj[i].innerHTML = html + this.selectorObj[i].innerHTML;

        return this;
    }

    public html(htmlInput?: string): any {

        if (htmlInput) {
            for (var i = 0; i < this.selectorObj.length; i++)
                this.selectorObj[i].innerHTML = htmlInput;

            return this;
        }
        else {
            htmlInput = '';
            for (var i = 0; i < this.selectorObj.length; i++)
                htmlInput += this.selectorObj[i].innerHTML;

            return htmlInput;
        }

    }


    public before(elem: any) {

        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i].parentNode) {
                this.selectorObj[i].parentNode.insertBefore(elem, this.selectorObj[i]);
            }
        }

        return this;

    }

    public after(htmlString: any) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            this.selectorObj[i].insertAdjacentHTML('afterend', htmlString);

            //if (this.selectorObj[i].parentNode) {
            //    this.selectorObj[i].parentNode.insertBefore(elem, this.selectorObj[i].nextSibling);
            //}
        }

        return this;
    }


    public properties(obj: any) {


        obj.get = function (key: string) {
            if (this[key] === undefined)
                return '';
            try {
                return eval(this[key]);
            } catch (e) {
                return this[key];
            }
        }
        return obj;

    }

    createElement(html: string) {
        var container = document.createElement('div');
        container.innerHTML = html;
        return container.firstChild;
    }






    public data(attr: any, value?: any) {

        for (var i = 0; i < this.selectorObj.length; i++) {
            if (value !== undefined) {

                value = JSON.stringify(value);
                this.selectorObj[i].dataset[attr] = value;
            }
            else {
                var ret = this.selectorObj[i].dataset[attr];
                if (ret !== undefined) {
                    ret = JSON.parse(ret);
                    return ret;
                }
                return null;

            }
        }
    }



    public css(cssrules: any) {

        for (var i = 0; i < this.selectorObj.length; i++) {
            for (var x in cssrules) {
                this.selectorObj[i].style[x] = cssrules[x];
            }

        }
        return this;

    }



    public attr(attrname: any, attrvalue: any) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i] !== undefined)
                this.selectorObj[i].setAttribute(attrname, attrvalue);

        }

    }


    public addClass(classname: string) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i] !== undefined)
                this.selectorObj[i].className += ' ' + classname;
        }
        return this;
    }

    public removeClass(classname: string) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i] !== undefined)
                this.selectorObj[i].className = this.selectorObj[i].className.replace(classname, '');
        }
        return this;
    }

    public toggleClass(classname: string) {

        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i].className.indexOf(classname) > -1) {
                this.removeClass(classname);
            }
            else {
                this.addClass(classname);

            }

        }
        return this;
    }


    fadeIn(speed: number) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i] !== undefined) {
                var el = this.selectorObj[i];
                el.style.opacity = 0;

                var last = +new Date();
                var tick = function () {
                    el.style.opacity = +el.style.opacity + (new Date() as any - last) / 400;
                    last = +new Date();

                    if (+el.style.opacity < 1) {
                        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                    }
                };
                tick();
            }
        }
    }


    fadeOut() {
        for (var i = 0; i < this.selectorObj.length; i++) {
            if (this.selectorObj[i] !== undefined) {
                var el = this.selectorObj[i];
                el.style.opacity = 1;

                var last = +new Date();
                var tick = function () {
                    el.style.opacity = -el.style.opacity - (new Date() as any - last) / 400;
                    last = +new Date();

                    if (+el.style.opacity > 0) {
                        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                    }
                };
                tick();
            }
        }
    }


    public on(EVENT_NAME: string, callback: Function) {

        for (var i = 0; i < this.selectorObj.length; i++) {
            var elm = this.selectorObj[i];
            if (elm.addEventListener)
                elm.addEventListener(EVENT_NAME, callback, false);
            else
                elm.attachEvent('on' + EVENT_NAME, callback);

        }
        return this;

    }


    public ajaxGet(url: string, callback: Function) {

        var r = new XMLHttpRequest();
        r.open('GET', url, true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;
            callback(r.responseText);

        };
        r.send();

    }

    public each(callback: Function) {
        for (var i = 0; i < this.selectorObj.length; i++) {
            callback(this.selectorObj[i], i);
        }

    }

    public getScript(url: string, arg1: any, arg2: any) {
        var cache = false, callback: Function = null;
        //arg1 and arg2 can be interchangable
        if (typeof (arg1) == 'function') {
            callback = arg1;
            cache = arg2 || cache;
        } else {
            cache = arg1 || cache;
            callback = arg2 || callback;
        }

        var load = true;
        //check all existing script tags in the page for the url
        scripter(`script[type='text/javascript']`)
            .each(function (obj: any, index: number) {

                return load = (url != obj.getAttribute('src'));
            });
        if (load) {
            scripter().ajaxGet(url, function (data: any) {


                //   var s = scripter().createElement('<script></script>');

                //   s.setAttribute('src', url);
                //  s.innerHTML = data;
                eval(data);


                callback(data);

            });
        } else {
            //already loaded so just call the callback
            if (typeof (callback) == 'function') {
                callback.call(this);
            };
        };
    };


}
