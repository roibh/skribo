import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-full-editor',
  templateUrl: './full-editor.component.html',
  styleUrls: ['./full-editor.component.css']
})
export class FullEditorComponent implements OnInit, OnChanges {
  text;
  options;
  onChange;


  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();



  public _code: string;


  @Input()
  set code(code: string) {
    if (code !== this._code) {
      this._code = code;
    }

  }
  @Input() variables: any;


  editorOptions;


  constructor() {
    this.options = { printMargin: false };
    this.onChange = (data) => {

      this.code = data;
      // this.notify.emit(this.code);
    };
  }
  ngOnChanges(changes: any) {
    // this.notify.emit(changes.currentValue);
  }
  fullEdit() {
    window.open('assets/monaco.html');
  }

  onInit(editor) {
    setTimeout(() => {
      const fileName = 'filename/facts.d.ts';
      const javascriptDefaults = (window as any).monaco.languages.typescript.javascriptDefaults;
      // extra libraries
      if (!javascriptDefaults._extraLibs[fileName]) {
        if (!this.variables || !Array.isArray(this.variables)) {
          this.variables = [];
        }
        javascriptDefaults.addExtraLib([
          'declare class SkriboEnv {',
          ...this.variables.map((item) => {
            return `public static ${item.name}:any;`;
          }),
          'declare class Logger {',
          'static log(item:any):void;',
          '}',
          'declare class Util {',
          'static timespanToRange(timespan:string):{start: string, end:string};',
          '}',
          'declare class MccApp {',
          'static accounts();',
          'static select(account);',
          '}',




          'declare class AdWordsApp {',
          'static campaigns();',
          'static keywords();',
          'static report(query: string, options?:any);',
          'static currentAccount();',
          '};',
          'declare function SkriboPostResults(objectString:string);',
          'declare function SkriboLog(obj: any);',
          'declare function SkriboForAccounts(cb: Function, limit: number);',
          'declare const SkriboSyncUrl:string;',
          'declare class UrlFetchApp {',
          'static fetch(url:string, options: any)',
          '}',


          'declare class Utilities {',
          'static formatDate(date, timeZone, format)',
          '}',

          'declare class SpreadsheetApp {',
          'static create(name:string, cols?:number,rows?:number)',
          'static open(name:string)',
          'static openByUrl(SPREADSHEET_URL);',
          '}',
          'declare class DriveApp {',
          'static getFileById(name:string)',
          'static getRootFolder()',
          '}',
          'declare class Charts {',
          'static Position:any',
          '}'
        ].join('\n'), fileName);
      }
      editor.onKeyUp((change) => {
        this.notify.emit(this._code);
      });

    }, 2000);

  }

  ngOnInit() {







    this.editorOptions = { automaticLayout: true, theme: 'vs-dark', language: 'javascript' };
  }
}

