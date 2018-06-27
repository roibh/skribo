import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../user.context.service';
import { GoogleSignInSuccess } from 'angular-google-signin';
import { User } from '@skribo/client';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';


declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent {

  @Output()
  public userData: any;

  @Output()
  public user = new EventEmitter();

  public group: any;
  modalRef: BsModalRef;
  modalPromise: Function = null;

  /**
   *
   */
  constructor(private ref: ChangeDetectorRef,
    private modalService: BsModalService,
    private userService: UserService, private router: Router) {
    const win = window as any;
    if (win.chrome) {
      const interval = setInterval(() => {

        if (win.chrome.identity && win.chrome.identity.getProfileUserInfo) {
          clearInterval(interval);
          win.chrome.identity.getProfileUserInfo((profile) => {
            this.user.emit({ id: profile.id, name: profile.email });
            // this.userService.setUser(profile);
          });
        }

      }, 500);
    }

    this.user.subscribe(async ($event) => {
      const groups = await User.getGroups($event.id);

      const userRecord = $event;
      Object.assign(userRecord, { groups: groups });
      this.userService.setUser(userRecord);
      this.userData = userRecord;
      if (groups.length === 0) {
        this.router.navigateByUrl('/user');
      } else {
        this.userService.setGroup(groups[0]);
      }

      this.group = groups[0];
      this.ref.detectChanges();
    });
  }



  public auth2: any;
  private myClientId = '255821801347-26jlbq1ddll9gehc6ovbggl7viarjm52.apps.googleusercontent.com';

  public setGroup(group) {
    this.group = group;
    this.userService.setGroup(group);
  }


  public JoinGroup(template) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }
  public async JoinConfirm(group_id) {
    const user_id = this.userService.getUser().id;

    const result = await User.attachToGroup(user_id, { GroupId: group_id });
    console.log(result);
  }


  public ShareGroup(template) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  onGoogleSignInSuccess(event: GoogleSignInSuccess) {

    // alert(parent.document.location.href);
    // let googleUser: gapi.auth2.GoogleUser = event.googleUser;
    // let id: string = googleUser.getId();
    // let profile: gapi.auth2.BasicProfile = googleUser.getBasicProfile();
    // this.user.emit({ id: profile.getId(), name: profile.getName() });
    // //this.user.name = profile.getName();
    // console.log('ID: ' +
    //   profile
    //     .getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
  }







}
