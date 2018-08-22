import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { debug } from 'util';

export const enum VariablesMode {
  Set = 'set',
  Edit = 'edit'
}


@Component({
  selector: 'app-variables',
  templateUrl: './variables.component.html',
  styleUrls: ['./variables.component.css']
})



export class VariablesComponent implements OnInit, OnChanges {

  constructor() {
    this.variables = [];
  }
  @Output()
  notify: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  public variables: any[];
  @Input()
  public mode: VariablesMode;


  ngOnInit() {
  }

  ngOnChanges() {

    this.notify.emit(this.variables);
  }


  public addRow() {
    this.variables = this.variables || [];
    if (!Array.isArray(this.variables)) {
      this.variables = [];
    }
    this.variables.push({ name: 'name', value: 'value' });
    this.notify.emit(this.variables);
  }
  public delRow(index) {
    this.variables.splice(index, 1);
    this.notify.emit(this.variables);
  }



  public tableColumns = [
    { title: 'Name', name: 'name', sort: 'asc', },
    { title: 'Value', name: 'value', },

    // {
    //   title: 'Position',
    //   name: 'position',
    //   sort: false,
    //   filtering: { filterString: '', placeholder: 'Filter by position' }
    // },
    // { title: 'Office', className: ['office-header', 'text-success'], name: 'office', sort: 'asc' },
    // { title: 'Extn.', name: 'ext', sort: '', filtering: { filterString: '', placeholder: 'Filter by extn.' } },
    // { title: 'Start date', className: 'text-warning', name: 'startDate' },
    // { title: 'Salary ($)', name: 'salary' }
  ];

}
