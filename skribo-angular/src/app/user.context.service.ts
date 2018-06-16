import { Injectable, Output } from '@angular/core';


@Injectable()
export class UserService {

  constructor() { }

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
}
