

const gateway = "http://localhost:6200";
import { Embed, Log, Scripts } from '@skribo/client';
declare const document: any;
declare const window: any;
declare const console: any;

export class Mock {

    async Script() {
        Scripts.base = gateway;
        const script_id = document.getElementById('script_id').value;
        const result = await Scripts.list('1');

        // const scriptUrl = `${gateway}/scripts/${script_id}`; //
        // fetch(scriptUrl).then((result) => {
        //     result.json().then((value) => {
        //         document.getElementById('fetched_script').value = JSON.stringify(value);
        //     });

        // })
    }
    async Log() {
        Log.base = gateway;

        const result = await Log.log({ name: 'a log entry' }, '1', '1', '1');
        console.log(result);



        // const scriptUrl = `${gateway}/scripts/${script_id}`; //
        // fetch(scriptUrl).then((result) => {
        //     result.json().then((value) => {
        //         document.getElementById('fetched_script').value = JSON.stringify(value);
        //     });

        // })
    }
}


window.onload = function () {
    const mock = new Mock();
    mock.Log();

}


