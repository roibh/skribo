import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { FormsModule } from '@angular/forms';
import { DynamicFormsBootstrapUIModule } from "@ng-dynamic-forms/ui-bootstrap";
 
import { ModalModule, } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Ng2TableModule, NgTableFilteringDirective, NgTablePagingDirective, NgTableComponent, NgTableSortingDirective } from 'ng2-table';
import { LoadersCssModule } from 'angular2-loaders-css';
import { LoaderComponent } from './loader/loader.component';
import { AdScriptComponent } from './ad-script/ad-script.component';
import { AceEditorDirective } from 'ng2-ace';
import { EditorComponent } from './editor/editor.component';
import { AceEditorModule } from 'ng2-ace-editor';
import { VariablesComponent } from './variables/variables.component';
import { ManageComponent } from './manage/manage.component';
import { InfoComponent } from './info/info.component';
import { FireService } from './fire.service';
import { MotivationService } from './motivation.service';
import { StorageService } from './storage.service';
import { Scripts, Embed, Results, User } from '@skribo/client';
import { HotTableModule } from '../assets/ng2-handsontable';
const serverUrl = 'https://skribo.herokuapp.com';
 
Embed.base = serverUrl;
Scripts.base = serverUrl;
Results.base = serverUrl;
User.base = serverUrl;


import * as M from '@methodus/client';
import { LoginComponent } from './login/login.component';
import { InstallComponent } from './install/install.component';
import { UserService } from './user.context.service';
import { ToastModule, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { EmbedListComponent } from './embed-list/embed-list.component';
import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';
import { ChartComponent } from './chart/chart.component';
import { ResultViewerComponent } from './result-viewer/result-viewer.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { CustomOption } from './customOption';
import { FullEditorComponent } from './full-editor/full-editor.component';

import { MonacoEditorModule, NgxMonacoEditorConfig } from '../assets/ngx-monaco-editor';
import { VariableFieldComponent } from './variable-field/variable-field.component';
import { AccountSelectorComponent } from './account-selector/account-selector.component';
import { GridComponent } from './grid/grid.component';
import { VariablesFillComponent } from './variables-fill/variables-fill.component';
import { VariableFieldFillComponent } from './variable-field-fill/variable-field-fill.component';


const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: '/options/dist/assets/', // configure base path for monaco editor
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: () => {
   

    const _monaco = (<any>window).monaco;
    // validation settings
    _monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });

    // compiler options
    _monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES5,
      allowNonTsExtensions: true
    });

   
  } // here monaco object will be available as window.monaco use this function to extend monaco editor functionality.
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/adscript/manage', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user/details', component: UserInfoComponent },

  { path: 'adscript/manage/create', component: AdScriptComponent },
  { path: 'adscript/manage/:id/details', component: AdScriptComponent },
  { path: 'adscript/edit/:id/details', component: FullEditorComponent },
  { path: 'adscript/manage/:script_id/:embed_id/:id/spreadsheet', component: ResultViewerComponent },
  { path: 'adscript/manage', component: ManageComponent },
];

@NgModule({

  declarations: [
    AppComponent,
    DashboardComponent,
    LoaderComponent,
    AdScriptComponent,
    EditorComponent,
    VariablesComponent,
    ManageComponent,
    InfoComponent,
    LoginComponent,
    InstallComponent,
    EmbedListComponent,
    SpreadsheetComponent,
    ChartComponent,
    ResultViewerComponent,
    UserInfoComponent,
    FullEditorComponent,
    VariableFieldComponent,
    AccountSelectorComponent,
    GridComponent,
    VariablesFillComponent,
    VariableFieldFillComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    NgxChartsModule,
    NgxDatatableModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    Ng2TableModule,
    LoadersCssModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AceEditorModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsBootstrapUIModule,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    HotTableModule,
    MonacoEditorModule.forRoot(monacoConfig)
  ],
  providers: [FireService, StorageService, UserService, MotivationService, { provide: ToastOptions, useClass: CustomOption }],
  bootstrap: [AppComponent]
})
export class AppModule { }
