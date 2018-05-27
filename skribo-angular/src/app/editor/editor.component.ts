import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import { AceEditorDirective } from 'ng2-ace';
import 'brace/theme/clouds';
import 'brace/mode/javascript';

@Component({
  //directives: [AceEditorDirective],
  selector: 'app-editor',
  template: `
  <div ace-editor
       [(text)]="code" 
       [mode]="'javascript'"  
       [theme]="'clouds'"
       [options]="options"
       [readOnly]="false"
       [autoUpdateContent]="true"  
       [durationBeforeCallback]="1000"  
       (textChanged)="onChange($event)"
       style="min-height: 376px; width:100%; overflow: auto;"></div>
  `
})
export class EditorComponent implements OnInit, OnChanges {
  text;
  options;
  onChange;

  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();


  @Input()
  public code: string;


  constructor() {
    this.options = { printMargin: false };
    this.onChange = (data) => {
      
      this.code = data;
      this.notify.emit(this.code);
    }
  }

  ngOnChanges() {
    //this.notify.emit(this.code);
  }
  ngOnInit() {
  }
}