import { Component, OnInit, Input, OnChanges, Output } from '@angular/core';
import { ScriptModel } from '@skribo/client';




@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  constructor() { }
  @Input()
  data: any;

  @Input()
  script: ScriptModel;

  public chartData: any;
  public chartLabels: string[];

  @Output()
  public chartLabel: string;

  public chartValues: string[];

  @Output()
  public chartValue: string;

  public chartType = 'PieChart';




  ngOnInit() {
    this.chartLabels = [];
    this.chartValues = [];
    this.chartType = this.script.ResultsDescriptor.chartType[0];

    switch (this.chartType) {
      case 'pie':
        this.chartLabels.push('label');
        this.chartValues.push('value');
        this.chartData = this.data.map((item) => {
          return { name: item['label'], value: item['value'] };
        });
        break;
    }
    // if (Array.isArray(this.data)) {
    //   const firstObject = this.data[0];
    //   this.chartLabels.push('label');
    //   this.chartValues.push('value');
    //   // Object.keys(firstObject).forEach((key) => {
    //   //   if (!Number(firstObject[key])) {
    //   //     this.chartLabels.push(key);
    //   //   } else {
    //   //     this.chartValues.push(key);
    //   //   }

    //   // });
    //   this.chartData = this.data.map((item) => {
    //     return { name: item['account'], value: item['Impressions'] };
    //   });
    // } else {


    //   Object.keys(this.data).forEach((key) => {
    //     if (!Number(this.data[key])) {
    //       this.chartLabels.push(key);
    //     } else {
    //       this.chartValues.push(key);
    //     }

    //   });
    // }





    // this.chartLabels = this.data.map(item => item.label);
    // this.chartData = this.data.map(item => item.value);
  }


  redraw() {
    this.chartData = this.data.map((item) => {
      return { name: item[this.chartLabel], value: item[this.chartValue] };
    });
  }

}
