import { Component, OnInit, Input } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserService } from '../user.context.service';
import { Results } from '@skribo/client';
import { debug } from 'util';

@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.css']
})
export class SpreadsheetComponent implements OnInit {

  constructor(private modalService: BsModalService, private userService: UserService) { }
  modalRef: BsModalRef;
  collectionData: any;

  @Input()
  public script: any;

  @Input()
  public embedId: string;

  @Input()
  public userId: string;

  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  async ngOnInit() {





  }

  async spreadsheet(row, template) {
    this.modalRef = this.modalService.show(template, this.config);
    this.collectionData = await Results.listByScript(row.GroupId, row.ScriptId);
  }

}
