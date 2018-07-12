import { Component, OnInit, Input } from '@angular/core';
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
  public chartType = 'PieChart';

  ngOnInit() {
    this.chartData = this.data.map((item) => {
      return { name: item.label, value: item.value }
    });
    // this.chartLabels = this.data.map(item => item.label);
    // this.chartData = this.data.map(item => item.value);
  }

}
