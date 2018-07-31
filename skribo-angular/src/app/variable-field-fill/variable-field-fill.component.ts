import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-variable-field-fill',
  templateUrl: './variable-field-fill.component.html',
  styleUrls: ['./variable-field-fill.component.css']
})
export class VariableFieldFillComponent implements OnInit {

  constructor() { }
  VariableField: any;

  public propertyTypes: string[] = ['string', 'number', 'date', 'account', 'grid', 'url'];
  @Input()
  variable: any;

  @Input()
  mode: string;


  ngOnInit() {
    
  }

}
