import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {

  constructor() { }
  @Input()
  public variable: any;

  public rows: any[] = [[0, 1]];

  ngOnInit() {
    if (!this.variable.value || !Array.isArray(this.variable.value)) {
      this.variable.value = this.rows;
    }
  }

}
