import { Component, OnInit, ViewContainerRef, ChangeDetectorRef, ViewEncapsulation, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Scripts, ScriptModel, Results } from '@skribo/client';
import { UserService } from '../user.context.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { MotivationService } from '../motivation.service';

@Component({
  selector: 'app-ad-script',
  templateUrl: './ad-script.component.html',
  styleUrls: ['./ad-script.component.css'],
  encapsulation: ViewEncapsulation.None


})
export class AdScriptComponent implements OnInit {

  constructor(public toastr: ToastsManager, private ref: ChangeDetectorRef,
    private router: Router, vcr: ViewContainerRef,
    private motivationService: MotivationService,
    public userService: UserService, private route: ActivatedRoute) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  public script: ScriptModel;
  public testResult: any;
  public code: string;
  public variables: any;
  public resultSample: any;
  @Input()
  public resultsDescriptor: any;



  id: string;
  public info: { Name: string, Description: string };

  onCode($event) {
    this.code = $event;
  }
  onInfo($event) {
    this.info = $event;
  }
  onvariables($event) {
    this.variables = $event;
  }

  async ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this._Get(id);
    } else {
      this.info = { Name: '', Description: '' };
      this.code = `function skribo(){
      }`;

      this.variables = [];
    }
    this.ref.detectChanges();

  }

  async _Get(id) {
    if (id) {
      this.script = await Scripts.get(this.userService.getGroup().GroupId, id);
      this.resultsDescriptor = this.script.ResultsDescriptor;
      if (this.script.ResultsDescriptor && typeof this.script.ResultsDescriptor === 'string') {
        this.resultsDescriptor = JSON.parse(this.script.ResultsDescriptor);
      }
      if (!this.resultsDescriptor) {
        this.resultsDescriptor = { chartType: ['pie'] };
      }
      const resultSampleData = await Results.getSample(this.script.GroupId, this.script.ScriptId);
      this.resultSample = Object.keys(resultSampleData[0]);


      this.variables = this.script.Variables;
      this.code = this.script.Code;
      this.info = { Name: this.script.Name, Description: this.script.Description };
    }
  }

  async _Save(navigate: boolean) {
    const saveObj: ScriptModel = Object.assign(this.info, { Code: this.code },
      { Variables: this.variables, ResultsDescriptor: this.resultsDescriptor });
    let id: any = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      id = this.id;
    }
    const group_id = this.userService.getGroup().GroupId;
    if (id) {
      await Scripts.update(group_id, id, saveObj);
    } else {
      saveObj.GroupId = group_id;
      const result = await Scripts.create(group_id, saveObj);

      this.id = result.ScriptId;
    }
    this.toastr.success(this.motivationService.goodOne(), 'Success!');
    if (navigate) {
      this.router.navigate(['adscript/manage']);
    }
  }

  async _Execute() {
    try {
      eval(this.code);
      this.toastr.success(this.motivationService.goodOne(), 'It compiles!');
    } catch (error) {
      this.testResult = error;
    }
  }
}
