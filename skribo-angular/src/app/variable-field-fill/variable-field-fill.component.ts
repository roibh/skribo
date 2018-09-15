import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-variable-field-fill',
  templateUrl: './variable-field-fill.component.html',
  styleUrls: ['./variable-field-fill.component.css']
})
export class VariableFieldFillComponent implements OnInit {

  constructor() { }
  VariableField: any;

  public propertyTypes: string[] = ['string', 'number', 'date',   'date-span', 'account', 'grid', 'url'];
  @Input()
  variable: any;

  @Input()
  mode: string;

  ranges: string[];

  ngOnInit() {
    this.ranges = ['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'THIS_WEEK_SUN_TODAY',
      'THIS_WEEK_MON_TODAY', 'LAST_WEEK', 'LAST_14_DAYS', 'LAST_30_DAYS',
      'LAST_WEEK', 'LAST_BUSINESS_WEEK', 'LAST_WEEK_SUN_SAT', 'THIS_MONTH', 'LAST_MONTH', 'ALL_TIME'
    ];
  }

}
