import { Component, OnInit, Input, Output, NgZone, EventEmitter } from '@angular/core';
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
  modalConfirmRef: BsModalRef;
  @Input()
  public list: any;

  @Input()
  public script: any;

  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();


  @Output()
  embed: any;
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  scriptPipe: string;
  async ngOnInit() {
    if (typeof this.script.Variables === 'string') {
      this.script.Variables = JSON.parse(this.script.Variables);
    }
    this.scriptPipe = await (await fetch('assets/pipe.js')).text();
    this.list.forEach((item: any) => {
      item.sourceUrl = this.getSourceUrl(item);
    });
  }

  public async deleteEmbed(embed, index, template) {
    this._ngZone.run(async () => {
      this.embed = embed;
      this.modalConfirmRef = this.modalService.show(template, { class: 'modal-md' });
    });
  }

  public async editEmbed(embed, template) {
    this._ngZone.run(async () => {
      this.embed = embed;

      const _variables: any = {};
      if (this.script.Variables) {
        this.script.Variables.forEach((item) => {
          _variables[item.name] = item;
        });

        if (this.embed.Variables) {
          this.embed.Variables.forEach((item) => {
            if (_variables[item.name]) {
              Object.assign(_variables[item.name], item);
            }
          });
        }

        this.embed.Variables = Object.keys(_variables).map((key) => {
          return { name: key, value: _variables[key].value, type: _variables[key].type };
        });

      }



      this.modalRef = this.modalService.show(template, this.config);
    });
  }

  public async confirm() {
    await Embed.delete(this.embed.ScriptId, this.embed.GroupId.toString(), this.embed.EmbedId);
    this.list.splice(this.list.indexOf(this.embed), 1);
    this.modalConfirmRef.hide();
  }

  public async decline() {
    this.modalConfirmRef.hide();
  }


  public async saveEmbed() {
    const group = this.userService.getGroup();
    if (!this.embed.EmbedId) {
      await Embed.create(this.embed, this.script.ScriptId, group.GroupId);
    } else {
      await Embed.update(this.embed, this.script.ScriptId, group.GroupId, this.embed.EmbedId);
    }
    this.modalRef.hide();
    this.notify.emit(this.embed);
  }


  public async newEmbed(template) {
    if (typeof this.script.Variables === 'string') {
      this.script.Variables = JSON.parse(this.script.Variables);
    }
    this.embed = { Name: null, Variables: this.script.Variables };
    this.modalRef = this.modalService.show(template, this.config);
    this.notify.emit(this.embed);

  }


  public getSourceUrl(embed) {
    let templateString = (window as any).SkriboUrl + '/$SCRIPTURL$';
    const group = this.userService.getGroup();
    const dataUrl = embed.ScriptId + '/' + group.GroupId + '/' + embed.EmbedId;
    templateString = templateString.replace(/\$SCRIPTURL\$/g, `serve/${dataUrl}`);
    return templateString;
  }
  public async createEmbed(embed) {

    let templateString = this.scriptPipe;
    const user = this.userService.getUser();
    const group = this.userService.getGroup();
    const dataUrl = embed.ScriptId + '/' + group.GroupId + '/' + embed.EmbedId;
    templateString = templateString.replace(/\$SCRIPTURL\$/g, `serve/${dataUrl}`);
    templateString = templateString.replace(/\$LOGURL\$/g, `log/${dataUrl}`);
    templateString = templateString.replace(/\$RESULTURL\$/g, `results/${dataUrl}/`);
    templateString = templateString.replace(/\$SERVERURL\$/g, `${(window as any).SkriboUrl}`);
    templateString = templateString.replace(/\$SYNCURL\$/g, `sync/${dataUrl}/accounts`);



    templateString = templateString.replace(/\$SKRIBODATA\$/g, `'` + JSON.stringify({
      'user_id': user.id,
      'base_url': (window as any).SkriboUrl
    }) + `'`);


    // replace variables
    // this.embed.Variables.forEach((element: any) => {
    //   templateString = templateString.replace(`$${element.name}$`, element.value);
    // });

    (document.getElementById('InstallScript') as any).value = templateString;
  }
}
