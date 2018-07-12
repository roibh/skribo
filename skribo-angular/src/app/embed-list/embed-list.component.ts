import { Component, OnInit, Input, Output, NgZone } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Embed } from '@skribo/client';
import { UserService } from '../user.context.service';

@Component({
  selector: 'app-embed-list',
  templateUrl: './embed-list.component.html',
  styleUrls: ['./embed-list.component.css']
})
export class EmbedListComponent implements OnInit {

  constructor(private _ngZone: NgZone, private modalService: BsModalService, private userService: UserService) { }
  modalRef: BsModalRef;
  @Input()
  public list: any;

  @Input()
  public script: any;

  @Output()
  embed: any;
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  ngOnInit() {
    if (typeof this.script.Variables === 'string') {
      this.script.Variables = JSON.parse(this.script.Variables);
    }
  }

  public async deleteEmbed(embed, index) {
    await Embed.delete(embed.ScriptId, embed.UserId.toString(), embed.EmbedId);
    this.list.splice(index, 1);
  }


  public async editEmbed(embed, template) {
    this._ngZone.run(async () => {
      this.embed = embed;

      const _variables: any = {};
      this.script.Variables.forEach((item) => {
        _variables[item.name] = item.value;
      });

      this.embed.Variables.forEach((item) => {
        _variables[item.name] = item.value;
      });

      this.embed.Variables = Object.keys(_variables).map((key) => {
        return { name: key, value: _variables[key] };
      });




      this.modalRef = this.modalService.show(template, this.config);
    });
  }


  public async saveEmbed() {
    const group = this.userService.getGroup();
    if (!this.embed.EmbedId) {
      await Embed.create(this.embed, this.script.ScriptId, group.GroupId);
    } else {
      await Embed.update(this.embed, this.script.ScriptId, group.GroupId, this.embed.EmbedId);
    }
    this.modalRef.hide();
  }


  public async newEmbed(template) {
    if (typeof this.script.Variables === 'string') {
      this.script.Variables = JSON.parse(this.script.Variables);
    }
    this.embed = { Name: null, Variables: this.script.Variables };
    this.modalRef = this.modalService.show(template, this.config);

  }

  public async createEmbed(embed) {
    const scriptPipe = await fetch('assets/pipe.js');
    let templateString = await scriptPipe.text();
    const user = this.userService.getUser();
    const group = this.userService.getGroup();
    const dataUrl = embed.ScriptId + '/' + group.GroupId + '/' + embed.EmbedId;
    templateString = templateString.replace(/\$SCRIPTURL\$/g, `serve/${dataUrl}`);
    templateString = templateString.replace(/\$LOGURL\$/g, `log/${dataUrl}`);
    templateString = templateString.replace(/\$RESULTURL\$/g, `results/${dataUrl}/`);
    templateString = templateString.replace(/\$SERVERURL\$/g, `https://skribo.herokuapp.com/`);
    templateString = templateString.replace(/\$SYNCURL\$/g, `sync/${dataUrl}/accounts`);



    templateString = templateString.replace(/\$SKRIBODATA\$/g, `'` + JSON.stringify({
      'user_id': user.id,
      'base_url': 'https://skribo.herokuapp.com'
    }) + `'`);


    // replace variables
    // this.embed.Variables.forEach((element: any) => {
    //   templateString = templateString.replace(`$${element.name}$`, element.value);
    // });

    (document.getElementById('InstallScript') as any).value = templateString;
  }
}
