import { Component, OnInit, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ScriptModel } from '@skribo/client';


@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.css']
})
export class InstallComponent implements OnInit {

  constructor(private modalService: BsModalService) { }
  modalRef: BsModalRef;
  @Input()
  script: ScriptModel;

  embedCode: string;
  async ngOnInit() {
    const scriptPipe = await fetch('assets/pipe.js');
   
    this.embedCode = await scriptPipe.text();
    debugger
    //  `function main(){

    // }`;

  }
  public installDialog(template) {
    this.modalRef = this.modalService.show(template);
  }
}
