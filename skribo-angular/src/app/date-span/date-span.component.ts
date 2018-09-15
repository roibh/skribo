import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-date-span',
  templateUrl: './date-span.component.html',
  styleUrls: ['./date-span.component.css']
})
export class DateSpanComponent implements OnInit {
  public ranges: ['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'THIS_WEEK_SUN_TODAY',
    'THIS_WEEK_MON_TODAY', 'LAST_WEEK', 'LAST_14_DAYS', 'LAST_30_DAYS',
    'LAST_WEEK', 'LAST_BUSINESS_WEEK', 'LAST_WEEK_SUN_SAT', 'THIS_MONTH', 'LAST_MONTH', 'ALL_TIME'
  ];
  constructor() { }

  ngOnInit() {
  }

}
