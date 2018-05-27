import { Component, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import {
  DynamicFormControlModel, DynamicFormService, DynamicCheckboxModel,
  DynamicInputModel,
  DynamicRadioGroupModel, DynamicFormLayout
} from "@ng-dynamic-forms/core";
import { FormGroup } from '@angular/forms';
import { FireService } from '../fire.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';



@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  providers: [FireService]
})
export class CustomerComponent implements OnInit {


  constructor(private modalService: BsModalService,
    public formService: DynamicFormService,
    public fireService: FireService) { }

  modalRef: BsModalRef;
  formModel: DynamicFormControlModel[] = MY_FORM_MODEL;
  formGroup: FormGroup;
  formLayout: DynamicFormLayout = MY_FORM_LAYOUT;
  collectionData: any = [];

  public tableColumns = [
    { title: 'Name', name: 'name', sort: 'asc', filtering: { filterString: '', placeholder: 'Filter by name' } },
    { title: '#ID', name: 'id', sort: 'asc', filtering: { filterString: '', placeholder: 'Filter by id' } }
    // {
    //   title: 'Position',
    //   name: 'position',
    //   sort: false,
    //   filtering: { filterString: '', placeholder: 'Filter by position' }
    // },
    // { title: 'Office', className: ['office-header', 'text-success'], name: 'office', sort: 'asc' },
    // { title: 'Extn.', name: 'ext', sort: '', filtering: { filterString: '', placeholder: 'Filter by extn.' } },
    // { title: 'Start date', className: 'text-warning', name: 'startDate' },
    // { title: 'Salary ($)', name: 'salary' }
  ];
  async ngOnInit() {
    this.formGroup = this.formService.createFormGroup(this.formModel);
    this.list();

    ;
    let user = new (window as any).AdwordsUser({
      developerToken: 'INSERT_DEVELOPER_TOKEN_HERE', //your adwords developerToken
      userAgent: 'INSERT_COMPANY_NAME_HERE', //any company name
      clientCustomerId: 'INSERT_CLIENT_CUSTOMER_ID_HERE', //the Adwords Account id (e.g. 123-123-123)
      client_id: 'INSERT_OAUTH2_CLIENT_ID_HERE', //this is the api console client_id
      client_secret: 'INSERT_OAUTH2_CLIENT_SECRET_HERE',
      refresh_token: 'INSERT_OAUTH2_REFRESH_TOKEN_HERE'
    });

    let campaignService = user.getService('CampaignService', 'v201802')

    //create selector
    let selector = {
      fields: ['Id', 'Name'],
      ordering: [{ field: 'Name', sortOrder: 'ASCENDING' }],
      paging: { startIndex: 0, numberResults: (window as any).AdwordsConstants.RECOMMENDED_PAGE_SIZE }
    }

    campaignService.get({ serviceSelector: selector }, (error, result) => {
      console.log(error, result);
    })


  }
  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  async list() {
    const result = await this.fireService.fetch('Project');
    this.collectionData = [];
    result.forEach((item) => { this.collectionData.push(Object.assign(item.data(), { id: item.id })) })
  }
  async submit(data) {
    let body = {};
    Object.keys(data.form.controls).forEach((key) => {
      const control = data.form.controls[key];
      body[key] = control.value;
    });

    await this.fireService.add('Project', body);
    this.list();
  }
}

export const MY_FORM_LAYOUT = {

  "name": {

    element: {
      label: "control-label"
    },
    grid: {
      container: "row",
      control: "col-sm-9",
      label: "col-sm-3"
    }
  },

  "sampleRadioGroup": {

    element: {
      label: "control-label"
    },
    grid: {
      container: "row",
      control: "col-sm-9",
      label: "col-sm-3"
    }
  }
};
export const MY_FORM_MODEL: DynamicFormControlModel[] = [

  new DynamicInputModel({

    id: "name",
    label: "Customer name",
    maxLength: 200,
    placeholder: "Customer name"
  }),

  new DynamicRadioGroupModel<string>({

    id: "sampleRadioGroup",
    label: "Sample Radio Group",
    options: [
      {
        label: "Option 1",
        value: "option-1",
      },
      {
        label: "Option 2",
        value: "option-2"
      },
      {
        label: "Option 3",
        value: "option-3"
      }
    ],
    value: "option-3"
  }),

  new DynamicCheckboxModel({

    id: "sampleCheckbox",
    label: "I do agree"
  })
];

