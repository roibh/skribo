import { Injectable } from '@angular/core';

@Injectable()
export class MotivationService {

  constructor() { }

  good: string[] = ['You are awsome!', 'I love you.', 'Great, do that again'];
  bad: string[] = ['That\'s bad!', 'Ooooops...', 'Bad robot!'];

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  goodOne() {
    return this.good[this.getRandomInt(this.good.length)];
  }
  badOne() {
    return this.bad[this.getRandomInt(this.bad.length)];
  }
}
