let JUNTAS_DEBUG = 'juntas:commands';





var dActiveElement = null;

function _dom_trackActiveElement(evt) {
    if (evt && evt.target) {
        dActiveElement = evt.target;
        console.log("focus on: " + dActiveElement.nodeName + " id: " + dActiveElement.id);
    } else {
        console.log("focus else..");
    }
}

if (document.addEventListener) {
    document.addEventListener("focus", _dom_trackActiveElement, true);
}








function insertScript(activeElement) {

    function insertTextAtCursor(text) {
        console.log("insertTextAtCursor : " + text);
        debugger
        if (activeElement.nodeName.toUpperCase() == "TEXTAREA") {
            console.log("selection in textarea!  id: " + activeElement.id);

            var ta = activeElement;


            var newvalue = ta.value.slice(0, ta.selectionStart) + text + ta.value.slice(ta.selectionEnd, ta.length);
            console.log("output : " + newvalue + ", len : " + newvalue.length);
            var newSelectionEnd = ta.selectionStart + text.length;

            ta.value = newvalue;
            ta.selectionStart = ta.selectionEnd = (newSelectionEnd);
        } else {
            alert("BBCodePaste only works in TEXTAREA fields.")
        }
    }




    const input: any = document.querySelectorAll('.script-editor .script-name input');
    input[0].value = 'a new script name';


    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = "a new script code";
    document.body.appendChild(copyFrom);
    copyFrom.focus();
    document.execCommand('SelectAll');
    document.execCommand('Copy');
    document.body.removeChild(copyFrom);

    insertTextAtCursor("a new script code");
    alert((window as any).CodeMirror);

    debugger
    const codeEditor: any = document.querySelectorAll('.CodeMirror-scroll');
    // codeEditor.value = "asdadasdasdasd asdasdasdasd";
    // codeEditor[0].value = '';
    codeEditor[0].focus();

    //CodeMirror-line 
    document.execCommand('selectAll');
    if (document.execCommand('paste')) {
        let result = codeEditor[0].value;
        console.log('got value from sandbox: ' + result);
    }


    // var myCodeMirror = CodeMirror.fromTextArea(codeEditor[0]);


}



function toString(functionName) {

    // (function () { 
    //     var aName = "Barry";
    // })


    return '(' + functionName.toString() + ')()';
}
class background {
    logger: any = null;
    emittimeout: number = 200;

    constructor() {

        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                var historyItem = null;
                switch (request.command) {
                    case 'execute script':
                        chrome.tabs.getSelected((selectedTab) => {
                            debugger
                            Chrome.sendMessage(selectedTab.id, { command: 'execute script', options: request.options }, function (response) {
                                console.log(response);
                            });

                            // debugger;
                            // // alert(toString(insertScript));
                            // //debugger;
                            // const insertWithParam = this.generate(dActiveElement)
                            // chrome.tabs.executeScript(selectedTab.id, { code: toString(insertWithParam) });





                        })

                        break;
                }
            })

    }
    public generate(activeElement) {

        return insertScript(activeElement);
    }
    public user: any = null;
}
window.onload = () => {
    new background();
}
