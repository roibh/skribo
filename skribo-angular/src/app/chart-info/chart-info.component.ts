import { Component, OnInit, NgZone, Input, TemplateRef, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from '../user.context.service';

@Component({
  selector: 'app-chart-info',
  templateUrl: './chart-info.component.html',
  styleUrls: ['./chart-info.component.css']
})
export class ChartInfoComponent implements OnInit {


  constructor(private _ngZone: NgZone, private modalService: BsModalService, private userService: UserService) {
    this.chartDescriptor = { identifiers: null, measurements: null, timeOptions: null };
  }
  modalRef: BsModalRef;
  collectionData: any;

  @Input()
  public resultSample: any;

  @Input()
  public chartDescriptor: any;

  @Output()
  chartDescriptorHandler: EventEmitter<string> = new EventEmitter<string>();

  public measurements: any;
  public identifiers: any;
  public timeOptions: any;

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


  emitChanges(changes: any) {
    if (!changes) {
      return;
    }
    this.chartDescriptor.identifiers = this.identifiers;
    this.chartDescriptor.measurements = this.measurements;
    this.chartDescriptor.timeOptions = this.timeOptions;
    this._ngZone.run(async () => {
      this.chartDescriptorHandler.emit(this.chartDescriptor);
    });
  }
  async openDialog(resultSample, template) {
    this._ngZone.run(async () => {
      if (this.chartDescriptor) {
        this.measurements = this.chartDescriptor.measurements || [];
        this.identifiers = this.chartDescriptor.identifiers || [];
        this.timeOptions = this.chartDescriptor.timeOptions || [];
        if (this.resultSample) {
          this.resultSample = this.resultSample.filter(item => this.measurements.indexOf(item) === -1);
          this.resultSample = this.resultSample.filter(item => this.identifiers.indexOf(item) === -1);
          this.resultSample = this.resultSample.filter(item => this.timeOptions.indexOf(item) === -1);
        }
      }
      if (this.resultSample) {
        // this.resultSample = resultSample;
        this.modalRef = this.modalService.show(template, this.config);
      }

      // this.collectionData = await Results.listByScript(row.GroupId, row.ScriptId);

    });

  }


}
