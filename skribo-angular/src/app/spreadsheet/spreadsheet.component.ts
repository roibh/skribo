import { Component, OnInit, Input, ChangeDetectorRef, NgZone, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserService } from '../user.context.service';
import { Results, Embed, EmbedModel, ResultsModel } from '@skribo/client';
import { debug } from 'util';

@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.css']
})
export class SpreadsheetComponent implements OnInit {

  constructor(private _ngZone: NgZone, private modalService: BsModalService, private userService: UserService) { }
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
  modalPromise: Function = null;
  message: string;


  async ngOnInit() {





  }

  async openModal(template: TemplateRef<any>) {
    return new Promise<boolean>((resolve, reject) => {
      this.modalPromise = resolve;
      this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    });
  }

  confirm(): void {
    this.modalPromise(true);
    this.message = 'Confirmed!';
    this.modalRef.hide();
  }

  decline(): void {
    this.modalPromise(false);
    this.message = 'Declined!';
    this.modalRef.hide();
  }

  async spreadsheet(row, template) {
    this._ngZone.run(async () => {
      this.script = row;

      this.modalRef = this.modalService.show(template, this.config);
      this.collectionData = await Results.listByScript(row.GroupId, row.ScriptId);

    });

  }

  async remove(result: ResultsModel, template) {
    this._ngZone.run(async () => {
      try {
        const modalResult = await this.openModal(template);
        if (modalResult) {


          if (this.userService.getGroup()) {

            const group_id = this.userService.getGroup().GroupId;
            await Results.delete(group_id, result.ScriptId, result.EmbedId, result.ScriptId.toString());
            this.collectionData = await Results.listByScript(group_id, result.ScriptId);
            
          }



        }
      } catch (error) {
        console.error(error);
      }
    });

  }




}
