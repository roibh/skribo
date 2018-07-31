import { Component, OnInit, OnChanges, EventEmitter, Output, Input } from '@angular/core';
import { VariablesMode } from '../variables/variables.component';

@Component({
  selector: 'app-variables-fill',
  templateUrl: './variables-fill.component.html',
  styleUrls: ['./variables-fill.component.css']
})
export class VariablesFillComponent implements OnInit, OnChanges {

  @Output()
  notify: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public variables: any[];
  @Input()
  public mode: VariablesMode;

  ngOnInit() {
  }


  constructor() {
    this.variables = [];
  }

  ngOnChanges() {
    this.notify.emit(this.variables);
  }


  public addRow() {
    this.variables = this.variables || [];
    this.variables.push({ name: 'name', value: 'value' });
    this.notify.emit(this.variables);
  }
  public delRow(index) {
    this.variables.splice(index, 1);
    this.notify.emit(this.variables);
  }


}
