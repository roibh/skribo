import { Component, OnInit, Output, Input, OnChanges, EventEmitter, NgZone } from '@angular/core';
import { ResultsDescriptor } from '@skribo/client';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit, OnChanges {
  public chartTypes = ['pie', 'bar', 'line', 'lines'];
  public config = {
    //displayKey:"description" //if objects array passed which key to be displayed defaults to description,
    search: true //enables the search plugin to search in the list
  }


  @Input()
  public resultsDescriptor: ResultsDescriptor;



  @Output()
  notify: EventEmitter<any> = new EventEmitter<any>();


  @Input()
  public info: { Name: string, Decription?: string } = { Name: null }

  @Input()
  public code: string;

  @Input()
  public variables: string;

  @Input()
  public resultSample: string;


  public name: string;
  public description: string;

  constructor(private _ngZone: NgZone, ) {
    // this.info = { name: null }
  }

  async ngOnInit() {


  }

  chartDescriptorHandler(descriptor: any) {
    this._ngZone.run(async () => {
      this.resultsDescriptor.chartDescriptor = descriptor;
    });
  }

  ngOnChanges() {
    this.notify.emit(this.info);
  }
}


