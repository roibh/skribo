import { Component, OnInit, Output, Input, OnChanges, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit, OnChanges {

  @Output()
  notify: EventEmitter<any> = new EventEmitter<any>();


  @Input()
  public info: { name: string } = { name: null }

  @Input()
  public code: string;

  @Input()
  public variables: string;
  

  public name: string;

  constructor() {
   // this.info = { name: null }
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.notify.emit(this.info)
  }
}


