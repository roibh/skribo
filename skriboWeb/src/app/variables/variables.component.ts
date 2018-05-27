import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { debug } from 'util';

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

  
  ngOnInit() {
  }

  ngOnChanges() {
    
    this.notify.emit(this.variables);
  }
  public addRow() {
    this.variables = this.variables || [];
    this.variables.push({ name: 'name', value: 'value' });
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