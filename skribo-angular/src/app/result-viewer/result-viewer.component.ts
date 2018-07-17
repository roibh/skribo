import { Component, OnInit, ViewContainerRef, Input, NgZone } from '@angular/core';
import { Results, ResultsModel, ScriptModel } from '@skribo/client';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { UserService } from '../user.context.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TabDirective } from 'ngx-bootstrap/tabs';
@Component({
  selector: 'app-result-viewer',
  templateUrl: './result-viewer.component.html',
  styleUrls: ['./result-viewer.component.css']
})
export class ResultViewerComponent implements OnInit {

  constructor(public toastr: ToastsManager, private modalService: BsModalService,
    private router: Router, vcr: ViewContainerRef,
    public userService: UserService, private route: ActivatedRoute,
    private _ngZone: NgZone) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  @Input()
  Data: any;

  @Input()
  public sheets: any;

  @Input()
  public script: ScriptModel;

  @Input()
  resultData: any;

  tableChartData: any;
  rows: any;

  columns: any;
  colHeaders: any;

  isChart: boolean;
  options: any = {
    rowHeaders: true,
    columnSorting: true,
  };
  activeSheet: any;
  modalRef: BsModalRef;
  modalConfig = {
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



  onSelect(data: TabDirective): void {
    this._ngZone.run(async () => {
      this.activeSheet = this.sheets[data.heading];
    });
  }


  async showResults(template, script) {
    this.sheets = [];
    this._ngZone.run(async () => {
      const group_id = this.userService.getGroup().GroupId;
      const id = this.resultData.ID;
      const embed_id = this.resultData.EmbedId;
      const script_id = this.resultData.ScriptId;
      const result = await Results.get(group_id, script_id, embed_id, id);
      const data = JSON.parse(result.Data);
      try {
        this.Data = JSON.parse(data.results);
        if (Array.isArray(this.Data)) {
          const objectRow = this.Data[0];

          const columns = Object.keys(objectRow).map((item) => {
            return {
              data: item,
              description: item,
              renderer: 'text',
              readOnly: true
            };
          });
          this.colHeaders = Object.keys(objectRow);
          this.options.colHeaders = this.colHeaders;

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
          this.sheets.push({ name: 'result', rows: this.Data, colHeaders: Object.keys(objectRow), columns: columns });
        } else {
          Object.keys(this.Data).forEach((key) => {
            const objectRow = this.Data[key][0];
            const colHeaders = Object.keys(objectRow);
            const columns = Object.keys(objectRow).map((item) => {
              return {
                data: item,
                description: item,
                renderer: 'text',
                readOnly: true
              };
            });
            this.sheets.push({ name: key, colHeaders: Object.keys(objectRow), columns: columns, rows: this.Data[key] });
          });
        }



      } catch (error) {
        // this.Data = [{ label: 'url', value: data.results }];
        // this.isChart = false;
      }

      this.rows = this.Data;

      // .map((row) => {
      //   return Object.values(row);


      //   // if (item.label === 'url') {
      //   //   item.value = ` <a href="${item.value}" target="_blank">click to view</a>`;
      //   // }
      //   // return item;

      // });


      this.modalRef = this.modalService.show(template, this.modalConfig);
    });
  }
  //
  async ngOnInit() {

  }

}
