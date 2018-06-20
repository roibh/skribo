import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  constructor() { }
  @Input()
  data: any;

  public chartData: any;
  public chartLabels: string[];
  public chartType: string = 'doughnut';

  ngOnInit() {
     
    this.chartLabels = this.data.map(item => item.label);
    this.chartData = this.data.map(item => item.value);
  }

}
