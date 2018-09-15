import { Component, OnInit, TemplateRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { FireService } from '../fire.service';
import { Scripts } from '@skribo/client';
import { UserService } from '../user.context.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']

})
export class ManageComponent implements OnInit {
  user: any;
  modalRef: BsModalRef;
  modalPromise: Function = null;
  message: string;

  constructor(private _ngZone: NgZone, private modalService: BsModalService, private userService: UserService) {
    this.user = userService.getUser();
  }
  collectionData: any = [];

  busy: boolean;

  async ngOnInit() {

    this.userService.onGroupChange(async (group) => {
      this._ngZone.run(async () => {
        this.busy = true;
        this.collectionData = await Scripts.list(group.GroupId);
        this.busy = false;
      });

    });

    if (this.collectionData.length === 0 && this.userService.getGroup()) {
      this._ngZone.run(async () => {
        this.busy = true;
        this.collectionData = await Scripts.list(this.userService.getGroup().GroupId);
        this.busy = false;
      });
    }
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

  async spreadsheet(id: string) {
    try {
      const group_id = this.userService.getGroup().GroupId;
      await Scripts.remove(group_id, id);
    } catch (error) {
      console.error(error);
    }
  }



  async remove(id: string, template) {
    try {
      const modalResult = await this.openModal(template);
      if (modalResult) {


        if (this.userService.getGroup()) {
          const group_id = this.userService.getGroup().GroupId;
          await Scripts.remove(group_id, id);
          this.collectionData = await Scripts.list(group_id);
        }



      }
    } catch (error) {
      console.error(error);
    }

  }




}
