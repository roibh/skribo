import { Component, OnInit } from '@angular/core';
import { FireService } from '../fire.service';


@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  constructor(private FireService: FireService) { }
  
  
  busy: boolean;

  ngOnInit() {

    this.FireService.busy.subscribe((value) => {
      this.busy = value;

    });
  }

}
