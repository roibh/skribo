import { Injectable, Output } from '@angular/core';


@Injectable()
export class UserService {

  constructor() {


  }
  @Output()
  public group;

  public groupChanges: Function[] = [];

  @Output()
  public user: any;

  public setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUser() {
    const str = localStorage.getItem('user');
    if (str) {
      return JSON.parse(str);
    }
  }

  public setGroup(group) {
  
    this.group = group;
    this.groupChanges.forEach(func => func(group));
  }



  public onGroupChange(callback) {
    this.groupChanges.push(callback);
  }
  public getGroup() {
    return this.group;
  }
}
