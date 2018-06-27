import { Component, OnInit, ViewContainerRef, Input } from '@angular/core';
import { Results, ResultsModel } from '@skribo/client';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { UserService } from '../user.context.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-result-viewer',
  templateUrl: './result-viewer.component.html',
  styleUrls: ['./result-viewer.component.css']
})
export class ResultViewerComponent implements OnInit {

  constructor(public toastr: ToastsManager, private modalService: BsModalService,
    private router: Router, vcr: ViewContainerRef,
    public userService: UserService, private route: ActivatedRoute) {
    this.toastr.setRootViewContainerRef(vcr);
  }
  Data: any;


  @Input()
  resultData: any;

  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'gray modal-lg'
  };

  async showResults(template) {

    const group_id = this.userService.getGroup().GroupId;
    const id = this.resultData.ID;
    const embed_id = this.resultData.EmbedId;
    const script_id = this.resultData.ScriptId;

    const result = await Results.get(group_id, script_id, embed_id, id);
    this.modalRef = this.modalService.show(template, this.config);


    const data = JSON.parse(result.Data);
    try {
      this.Data = JSON.parse(data.results);
    } catch (error) {
      this.Data = [{ label: 'url', value: data.results }];
    }

  }
  //
  async ngOnInit() {

  }

}
