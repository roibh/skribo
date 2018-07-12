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
  editorOptions;


  constructor() {
    this.options = { printMargin: false };
    this.onChange = (data) => {

      this.code = data;
      // this.notify.emit(this.code);
    }
  }
  ngOnChanges(changes: any) {
    // this.notify.emit(changes.currentValue);
  }
  fullEdit() {
    window.open('assets/monaco.html');
  }

  onInit(editor) {
    editor.onKeyUp((change) => {
      this.notify.emit(this._code);
    });
  }

  ngOnInit() {
    this.editorOptions = { automaticLayout: true, theme: 'vs-dark', language: 'javascript' };
  }
}

