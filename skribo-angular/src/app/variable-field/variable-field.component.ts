import { Component, OnInit, Input } from '@angular/core';

export const enum VariableField {
  String = 'string',
  Number = 'number',
}



@Component({
  selector: 'app-variable-field',
  templateUrl: './variable-field.component.html',
  styleUrls: ['./variable-field.component.css']
})

export class VariableFieldComponent implements OnInit {

  constructor() { }
  VariableField: any;

  public propertyTypes: string[] = ['string', 'number', 'date', 'account', 'grid', 'url'];
  @Input()
  variable: any;


  ngOnInit() {
    
  }

}
