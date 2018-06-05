import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { UserService } from '../user.context.service';
import { GoogleSignInSuccess } from 'angular-google-signin';

declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent {

  @Output()
  public userData: any;

  @Output()
  public user = new EventEmitter();
  /**
   *
   */
  constructor(private userService: UserService) {

    this.user.subscribe(($event) => {
      this.userService.setUser($event);
      //this.userData = $event;

    })


  }




  public auth2: any;
  private myClientId: string = '255821801347-26jlbq1ddll9gehc6ovbggl7viarjm52.apps.googleusercontent.com';

  onGoogleSignInSuccess(event: GoogleSignInSuccess) {
    let googleUser: gapi.auth2.GoogleUser = event.googleUser;
    let id: string = googleUser.getId();
    let profile: gapi.auth2.BasicProfile = googleUser.getBasicProfile();
    this.user.emit({ id: profile.getId(), name: profile.getName() });
    //this.user.name = profile.getName();
    console.log('ID: ' +
      profile
        .getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
  }







}
