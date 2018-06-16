import { Component, OnInit, Input, Output } from '@angular/core';
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

  constructor(private modalService: BsModalService, private userService: UserService) { }
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
  }

  public async deleteEmbed(embed, index) {
    await Embed.delete(embed.ScriptId, embed.UserId.toString(), embed.EmbedId);
    this.list.splice(index, 1);
  }


  public async editEmbed(embed, template) {
    this.embed = embed;
    this.modalRef = this.modalService.show(template, this.config);
  }


  public async saveEmbed() {
    const user = this.userService.getUser();

    if (!this.embed.EmbedId) {
      await Embed.create(this.embed, this.script.ID.toString(), user.id);
    } else {
      await Embed.update(this.embed, this.script.ID.toString(), user.id, this.embed.EmbedId);
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
    const scriptUrl = 'serve/' + embed.ScriptId + '/' + embed.UserId + '/' + embed.EmbedId;
    templateString = templateString.replace(/\$SCRIPTURL\$/g, scriptUrl);

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
