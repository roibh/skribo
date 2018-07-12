import { Component, OnInit, ViewContainerRef, Input } from '@angular/core';
import { Results, ResultsModel, ScriptModel } from '@skribo/client';
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
  public script: ScriptModel;

  @Input()
  resultData: any;

  tableChartData: any;
  rows: any;
  columns: any;
  isChart: boolean;

  modalRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'gray modal-lg'
  };


  getRowHeight(row) {
    // set default
    if (!row) {
      return 50;
    }
    // return my height
    return row.height;
  }


  async showResults(template, script) {

    const group_id = this.userService.getGroup().GroupId;
    const id = this.resultData.ID;
    const embed_id = this.resultData.EmbedId;
    const script_id = this.resultData.ScriptId;

    const result = await Results.get(group_id, script_id, embed_id, id);



    const data = JSON.parse(result.Data);



    try {
      this.Data = JSON.parse(data.results);
      const objectRow = this.Data[0];

      this.columns = Object.keys(objectRow).map((item) => {
        return { 'prop': item };
      });

      this.tableChartData = {
        chartType: 'Table',
        dataTable: [
          Object.keys(objectRow),
          ...this.Data.map(item => Object.values(item)),
          // ['Shoes', 10700, -100],
          // ['Sports', -15400, 25],
          // ['Toys', 12500, 40],
          // ['Electronics', -2100, 889],
          // ['Food', 22600, 78],
          // ['Art', 1100, 42]
        ],
        formatters: [
          {
            columns: [1],
            type: 'NumberFormat',
            options: {
              prefix: '&euro;', negativeColor: 'red', negativeParens: true
            }
          }
        ],
        options: { title: this.script.Name, allowHtml: true }
      };
      this.isChart = true;
    } catch (error) {
      this.Data = [{ label: 'url', value: data.results }];
      this.isChart = false;
    }

    this.rows = this.Data.map((item) => {
      if (item.label === 'url') {
        item.value = ` <a href="${item.value}" target="_blank">click to view</a>`;
      }
      return item;

    });
    const objectRow = this.Data[0];

    this.columns = Object.keys(objectRow).map((item) => {
      return { 'prop': item, 'expanded': true };
    });

    this.modalRef = this.modalService.show(template, this.config);
  }
  //
  async ngOnInit() {

  }

}
