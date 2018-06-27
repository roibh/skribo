import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.context.service';
import { User } from '@skribo/client';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css'],
  providers: [UserService]
})
export class UserInfoComponent implements OnInit {

  constructor(private userService: UserService) { }
  userData: any;

  async ngOnInit() {
   
    this.userData = this.userService.getUser();

    if (!this.userData) {
      setTimeout(() => { this.ngOnInit(); }, 500);
      return;
    }
  
    if (!this.userData.groups || this.userData.groups.length === 0) {
      await User.attachToGroup(this.userData.id, { 'Name': this.userData.name });
      this.userData = this.userService.getUser();
    }
  }

}
