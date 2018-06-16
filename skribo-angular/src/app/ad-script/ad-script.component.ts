import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FireService } from '../fire.service';
import { ActivatedRoute, Router } from '@angular/router';

import { EditorComponent } from '../editor/editor.component';
import { InfoComponent } from '../info/info.component';
import { Scripts, ScriptModel } from '@skribo/client';
import { UserService } from '../user.context.service';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-ad-script',
  templateUrl: './ad-script.component.html',
  styleUrls: ['./ad-script.component.css']


})
export class AdScriptComponent implements OnInit {

  constructor(public toastr: ToastsManager,
    private router: Router, vcr: ViewContainerRef,
    public userService: UserService, private route: ActivatedRoute) {
    this.toastr.setRootViewContainerRef(vcr);


  }
  public code: string;
  public variables: any;
  public info: { Name: string, Description: string };
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
    if (id) {

      await this._Get(id);
      // let result = await this.fireService.get('Script', id);
      // if (result) {
      //   this.info = result;
      //   this.code = result.code;
      //   this.variables = result.variables;
      // }
    }
    else {
      this.info = { Name: '', Description: '' };
      this.code = `function main(){
      }`;
      this.variables = [];
    }
  }

  async _Get(id) {
    if (id) {
      const script: ScriptModel = await Scripts.get(id);
      if (script.Variables) {
        this.variables = JSON.parse(script.Variables);
      }
      this.code = script.Code;
      this.info = { Name: script.Name, Description: script.Description };
    }
  }

  async _Save() {
    const saveObj: ScriptModel = Object.assign(this.info, { Code: this.code }, { Variables: this.variables });
    let id: any = this.route.snapshot.paramMap.get('id');
    if (id) {
      await Scripts.update(id, saveObj);
    } else {
      saveObj.Owner = this.userService.getUser().id;
      await Scripts.create(saveObj);
    }

    this.router.navigate(['adscript/manage']);
    this.toastr.success('You are awesome!', 'Success!');


    // if (id) {
    //   await this.fireService.update('Script', id, saveObj);
    // } else {
    //   await this.fireService.add('Script', saveObj);
    // }

  }

  async _Execute() {
    //send execution script to adwords
    (window.parent as any).postMessage('syncTo', '*');
  }
}
