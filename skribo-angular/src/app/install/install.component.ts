import { Component, OnInit, Input, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ScriptModel, Embed } from '@skribo/client';
import { UserService } from '../user.context.service';


@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.css']
})
export class InstallComponent implements OnInit {
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };
  user: any;
  constructor(private modalService: BsModalService, private userService: UserService) {
    this.user = this.userService.getUser();

  }
  modalRef: BsModalRef;
  @Input()
  script: ScriptModel;


  @Output()
  public embeded: any;

  @Output()
  public embedList: any;


  @Output()
  public variables: any;
  embedCode: string;
  async ngOnInit() {

  }

  public async onList() {
    this.embedList = await Embed.list(this.script.ScriptId.toString(), this.userService.getGroup().GroupId);
    this.embedList = this.embedList.map((item) => {
      // item.Variables = JSON.parse(item.Variables);
      return item;
    });
  }

  public async createEmbed() {
    // const user = this.userService.getUser();
    // await Embed.create(this.variables, this.script.ID.toString(), user.id);
    // const scriptPipe = await fetch('assets/pipe.js');
    // this.embedCode = await scriptPipe.text();
  }




  public async installDialog(template, script) {

    this.embedList = await Embed.list(this.script.ScriptId.toString(), this.userService.getGroup().GroupId);
    this.embedList = this.embedList.map((item) => {
      //item.Variables = JSON.parse(item.Variables);
      return item;
    });

    this.embeded = this.embedList && this.embedList.length > 0;
    this.modalRef = this.modalService.show(template, this.config);
  }
}
