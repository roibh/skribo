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
import { CustomerComponent } from './customer/customer.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
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
import { StorageService } from './storage.service';
import { Scripts } from '@skribo/client';

Scripts.base = 'http://localhost:6200';
//Scripts.base = 'https://skribo.herokuapp.com';

import * as M from '@methodus/client';
import { LoginComponent } from './login/login.component';
import { GoogleSignInComponent } from 'angular-google-signin';
import { InstallComponent } from './install/install.component';
import { UserService } from './user.context.service';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { ToastOptions } from 'ng2-toastr';

class CustomOption extends ToastOptions {
  animate = 'flyRight'; // you can override any options available
  newestOnTop = false;
  showCloseButton = true;
}


const appRoutes: Routes = [
  { path: '', redirectTo: '/adscript/manage', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'adscript/manage/create', component: AdScriptComponent },
  { path: 'adscript/manage/:id/details', component: AdScriptComponent },
  { path: 'adscript/manage', component: ManageComponent },
];

@NgModule({

  declarations: [
    AppComponent,
    CustomerComponent,
    DashboardComponent,
    DynamicTableComponent,
    LoaderComponent,
    AdScriptComponent,
    EditorComponent,
    VariablesComponent,
    ManageComponent,
    InfoComponent,
    LoginComponent,
    GoogleSignInComponent,
    InstallComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
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
    ToastModule.forRoot()
  ],
  providers: [FireService, StorageService, UserService, { provide: ToastOptions, useClass: CustomOption }],
  bootstrap: [AppComponent]
})
export class AppModule { }
