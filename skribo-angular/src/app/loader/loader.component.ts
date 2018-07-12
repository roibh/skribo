import { Component, OnInit, Input } from '@angular/core';
import { FireService } from '../fire.service';


@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  constructor() { }

  @Input()
  busy: boolean;

  ngOnInit() {


  }

}
