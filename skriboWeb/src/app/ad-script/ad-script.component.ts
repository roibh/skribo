import { Component, OnInit } from '@angular/core';
import { FireService } from '../fire.service';
import { ActivatedRoute } from '@angular/router';

import { EditorComponent } from '../editor/editor.component';
import { InfoComponent } from '../info/info.component';
@Component({
  selector: 'app-ad-script',
  templateUrl: './ad-script.component.html',
  styleUrls: ['./ad-script.component.css']


})
export class AdScriptComponent implements OnInit {

  constructor(public fireService: FireService, private route: ActivatedRoute) {


  }
  public code: string;
  public variables: any;
  public info: { name: string, code: string };
  onCode($event) {
    this.code = $event;
  }
  onInfo($event) {
    this.info = $event;
  }
  onvariables($event) {
    this.variables = $event;
  }


  async ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    let result = await this.fireService.get('Script', id);
    if (result) {
      this.info = result;
      this.code = result.code;
      this.variables = result.variables;
    }
  }

  async _Save() {
    const saveObj = Object.assign(this.info, { code: this.code }, { variables: this.variables });
    console.log(saveObj);
    let id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.fireService.update('Script', id, saveObj);
    } else {
      await this.fireService.add('Script', saveObj);
    }

  }

  async _Execute() { 
    //send execution script to adwords
    (window.parent as any).postMessage('syncTo', '*');
  }
}
