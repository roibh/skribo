
declare const CodeMirror: any;



var scripterSelectedElement: any = null;
function getUniqueSelector(el: any) {
    if (typeof (el.id) != 'undefined' && el.id != '')
        return '#' + el.id;
    if (el.className != '') {
        if (scripter('.' + el.className).toList().length == 1)
            return '.' + el.className;
    }
    return '';
}
function fullPath(el: any) {
    var names: any = [];
    while (el.parentNode) {
        if (el.id) {
            names.unshift('#' + el.id);
            break;
        } else {
            if (el == el.ownerDocument.documentElement) names.unshift(el.tagName);
            else {
                for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                names.unshift(el.tagName + ':nth-child(' + c + ')');
            }
            el = el.parentNode;
        }
    }
    return names.join(' > ');
}

function juntas_handle_pop() {
    var target = event.target;


}

class ourWork {
    temperedElement: any;
    constructor() {

        document.addEventListener('contextmenu', (evt: any) => {
            var xevent = Object.keys(evt).reduce((obj: any, key: string) => {
                obj[key] = typeof evt[key] === 'object' ? '{ ... }' : evt[key];
                return obj;
            }, {});

            scripterSelectedElement = evt.target;

            if (this.temperedElement && this.temperedElement.length > 0)
                scripter(this.temperedElement[0]).css(scripter(this.temperedElement[0]).data('style'));
            // event.stopPropagation();

            this.temperedElement = scripter(scripterSelectedElement);

            this.temperedElement.data('selected', true);
            //this.temperedElement.css(this.temperedElement.data('style'));
            //this.temperedElement.css({ 'border': '1px dashed blue' });


            // var uniqueSelector = getUniqueSelector(this.temperedElement.toList()[0]);

            // if (uniqueSelector === '') {
            //     uniqueSelector = fullPath(this.temperedElement.toList()[0]);
            // }




            // chrome.runtime.sendMessage({ command: 'set element', element: uniqueSelector }, (response) => {

            // });
        });


        window.addEventListener('delegate tab', (evt: any) => {

            /* message is in evt.detail */
            var detail = JSON.parse(evt.detail);
            chrome.runtime.sendMessage({ command: 'tabs:connect', tab: detail.tab }, (response) => {
                if (response.result === 'ok') {
                    this.juntascreateSideBar();
                }
            });
            //chrome.runtime.sendMessage({ command: 'config loaded', config: detail.config }, function (response) {
            //});
        }, false);






        var visProp = this.getHiddenProp();
        if (visProp) {
            var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
            document.addEventListener(evtname, () => {

                if (!this.isHidden()) {
                    if ((document as any).orgtitle)
                        document.title = (document as any).orgtitle;

                    //chrome.runtime.sendMessage({ command: 'reset comment count' }, (response) => { });
                }
            });
        }

        var oldLocation: any = null;
        var pagebody: any = null;
        setInterval(() => {

            if (oldLocation == null || window.location.href !== oldLocation) {

                var pagebody = document.getElementsByTagName('body');
                if (pagebody.length === 0)
                    return;


                if (window.location.href.indexOf('chrome/newtab?') > 0) {
                    return;
                }



                oldLocation = window.location.href;
                var x = document.getElementById('juntas-indication');
                if (pagebody.length > 0 && x === null) {
                    var ldiv = document.createElement('div');
                    ldiv.id = 'juntas_page_loader';
                    ldiv.className = 'sampleContainer juntas-hide';
                    ldiv.innerHTML = this.createLoader();
                    pagebody[0].appendChild(ldiv);


                    chrome.runtime.sendMessage({ command: 'get isjuntas' }, (response) => {
                        if (response && response.result) {
                            window.onscroll = function () {
                                var top = window.pageYOffset || document.documentElement.scrollTop,
                                    left = window.pageXOffset || document.documentElement.scrollLeft;
                                chrome.runtime.sendMessage({ command: 'scroll tab', details: { top: top, left: left } }, function (response) {
                                });
                            }
                            this.juntascreateSideBar();
                        }
                        else {
                            var div = document.createElement('div');
                            div.id = 'juntas-indication';

                            pagebody[0].appendChild(div);
                            chrome.runtime.sendMessage({ command: 'find isjuntas' }, (response) => { });
                        }
                    });
                }
                else {
                    var div = document.createElement('div');
                    div.id = 'juntas-indication';

                    pagebody[0].appendChild(div);
                    chrome.runtime.sendMessage({ command: 'find isjuntas' }, (response) => { });
                }


                chrome.runtime.sendMessage({ command: 'load annotations' }, (response) => {
                });


            }
        }, 500);



        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {

                console.log(request, sender, sendResponse);
                var historyItem = null;
                if (request.command.ping) {
                    sendResponse({ 'result': 'pong' });
                    return;
                }

                switch (request.command) {
                    case 'execute script':

                        const input: any = scripter('.script-editor .script-name input').single();
                        input.value = 'a new script name';

                        const codeEditor: any = scripter('.codemirror-container textarea').single();

                        codeEditor.select();
                        codeEditor.value = 'a new script name';
                        input.focus();
                        document.execCommand('selectAll');
                        // var myCodeMirror = CodeMirror.fromTextArea(codeEditor);
                        // codeEditor.value = 'a new script name';




                        sendResponse({ 'result': 'pong' });
                        break;
                    case 'hide annotations':
                        this.hideAnnotations();
                        break;
                    case 'show annotations':
                        this.showAnnotations(request.annotations);
                        sendResponse({ 'result': 'ok' });
                        break;
                    case 'show loader':
                        this.showLoader(true);
                        sendResponse({ 'result': 'ok' });
                        break;
                    case 'hide loader':
                        this.showLoader(false);
                        sendResponse({ 'result': 'ok' });
                        break;
                    case 'show sidebar':
                        this.juntascreateSideBar();
                        sendResponse({ 'result': 'ok' });
                        break;
                    case 'get history item':
                        sendResponse(request.data);
                        break;


                    case 'toggle sidebar':
                        this.togglecollapse(request.operation);
                        sendResponse({ 'result': 'ok' });
                        break;
                    case 'remove sidebar':
                        this.removeSidebar();
                        sendResponse({ 'result': 'ok' });
                        break;
                    case 'toggle indicationbar':
                        this.toggleindication(request.operation);
                        sendResponse({ 'result': 'ok' });
                        break;



                }
            });




    }

    createLoader() {
        return `
        
            <div class="loader">
                <span class="dot dot_1"></span>
                <span class="dot dot_2"></span>
                <span class="dot dot_3"></span>
                <span class="dot dot_4"></span>
            </div>`


    }



    juntascreateSideBar() {
        if (document.getElementById('juntasiframe') === null) {
            var p = document.createElement('div');
            p.id = 'juntas';
            p.className = 'right';
            var c = document.getElementsByTagName('body');
            var url = chrome.extension.getURL('app/sidebar.html');
            var frame = document.createElement('iframe');
            frame.id = 'juntasiframe';
            frame.onfocus = function () {

            };
            frame.src = url;
            p.appendChild(frame);
            c[0].appendChild(p);
            c[0].className += ' juntas';
        }
        else {
            var url = chrome.extension.getURL('app/sidebar.html');
            var frame: HTMLIFrameElement = document.getElementById('juntasiframe') as HTMLIFrameElement;
            frame.id = 'juntasiframe';
            frame.src = url;
        }


    }

    hideAnnotations() {
        scripter('.juntas_pop_note').remove();
    }

    showLoader(show: boolean) {

        if (show) {
            scripter('#juntas_page_loader').removeClass('juntas-hide');
        }
        else {
            scripter('#juntas_page_loader').addClass('juntas-hide');
        }

    }

    showAnnotations(result: any) {
        var _self = this;


        scripter('.juntas_annotation').remove();
        scripter('.juntas_pop_note').remove();
        result.annotations.forEach(function (item: any, index: number) {


            //scripter(item.Element).addClass('juntas_expose');
            var user = result.users[item.UserId];
            scripter(item.Element).after(`
                    <div class='juntas_pop_note' id='juntas_pop_note_${index}'>
                            <div id='juntas_pop_note_trigger_${index}'>
                                <p class='juntas_avatar_small'><img src='${user.Picture.data.url}'> ${user.FirstName} ${user.LastName}</p>
                            </div>
                    <div class='juntas_note' id='juntas_note_${index}'>${item.Annotation}</div>
                    </div>
                `);

            scripter(`#juntas_pop_note_trigger_${index}`).addClass('touched');
            scripter(`#juntas_pop_note_trigger_${index}`).on('click', function () {
                //var x = new expose(item.Element, {});

                scripter(`#juntas_pop_note_${index}`).toggleClass('juntas_pop_note_open');
                scripter(item.Element).toggleClass('juntas_expose');
                //_self.expose(item.Element);
            });

        });
    }


    expose(el: string) {
        //scripter('body').prepend('<div id='overlay'></div>');
        //scripter(el).css({ 'z-index': '99999' });

        scripter(el).addClass('juntas_expose');
        /// scripter('#overlay').fadeIn(300);

    }

    removeSidebar() {
        var j = document.getElementById('juntas');
        if (j !== null)
            j.parentElement.removeChild(j);


    }


    juntasShowIndicationGroups(data: any) {


    }


    toggleindication(operation: number) {
        var j = document.getElementById('juntasiframeindication');
        if (j !== null) {
            if (operation == 1) {
                j.classList.remove('juntasindication-collapse');
                j.classList.add('juntasindication-open');
            }
            else {
                j.classList.add('juntasindication-collapse');
                j.classList.remove('juntasindication-open');
            }
        }
    }

    togglecollapse(operation: number) {
        var j = document.getElementById('juntas');
        if (j !== null) {
            if (operation == 0) {
                j.classList.remove('juntas-collapse');
                j.classList.add('juntas-open');
            }
            else {
                j.classList.add('juntas-collapse');
                j.classList.remove('juntas-open');
            }
        }
    }


    getHiddenProp() {
        var prefixes = ['webkit', 'moz', 'ms', 'o'];

        // if 'hidden' is natively supported just return it
        if ('hidden' in document) return 'hidden';

        // otherwise loop over all the known prefixes until we find one
        for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document)
                return prefixes[i] + 'Hidden';
        }

        // otherwise it's not supported
        return null;
    }

    isHidden() {
        var prop = this.getHiddenProp();
        if (!prop) return false;

        return (document as any)[prop];
    }

    annotate() {
        chrome.runtime.sendMessage({ command: 'set annotation', annotation: scripter(event.target).html() }, (response) => {

        });
    }

    juntas_handle_pop() {
        var target = event.target;
    }
}



if (window.location.href.indexOf('https://adwords.google.com') > -1) {
    let juntasInstance = new ourWork();
}



