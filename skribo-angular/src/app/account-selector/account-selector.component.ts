import { Component, OnInit, NgZone, TemplateRef, Input } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-account-selector',
  templateUrl: './account-selector.component.html',
  styleUrls: ['./account-selector.component.css']
})
export class AccountSelectorComponent implements OnInit {

  constructor(private _ngZone: NgZone, private modalService: BsModalService, ) { }
  modalRef: BsModalRef;
  modalPromise: Function = null;

  @Input()
  public variable: any;

  
  ngOnInit() {
  }

  browseToSelect(template, value) {
    this.openModal(template)
  }
  async openModal(template: TemplateRef<any>) {
    return new Promise<boolean>((resolve, reject) => {
      this.modalPromise = resolve;
      this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    });
  }

}
