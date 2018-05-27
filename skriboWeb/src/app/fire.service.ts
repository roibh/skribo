import { Injectable, Output, EventEmitter } from '@angular/core';
import { StorageService } from './storage.service';


@Injectable()
export class FireService {
  config = {
    apiKey: "AIzaSyCQCy1r11CCdLVVktr8dc8qTGxv4Z8ZopE",
    authDomain: "ourwork-8b182.firebaseapp.com",
    databaseURL: "https://ourwork-8b182.firebaseio.com",
    projectId: "ourwork-8b182",
    storageBucket: "ourwork-8b182.appspot.com",
    messagingSenderId: "500759243283"
  };
  firebase: any;
  db: any;
  storage: StorageService;


  @Output()
  busy: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {
    this.storage = new StorageService();

  }

  async connect() {

    return new Promise((resolve, reject) => {

      if (!this.firebase) {
        this.firebase = (window as any).firebase;
        this.firebase.initializeApp(this.config);
        console.log('connected to fire base using', this.config);
        const settings = {/* your settings... */ timestampsInSnapshots: true };
        // firestore.settings(settings);

        this.db = this.firebase.firestore();
        this.db.settings(settings)
        resolve();

      } else {
        resolve();
      }
    })


  }


  async get(collectionName: string, id: any) {


    const result = await this.storage.get(collectionName, id);
    if (result) {
      return result;
    }

    this.busy.emit(true);
    console.log('FireService::get')
    await this.connect();
    const ref = this.db.collection(collectionName).doc(id);
    const doc = await ref.get();
    this.busy.emit(false);
    if (doc.exists) {
      return doc.data();
    } else {
      console.log("No such document!");
    }
  }

  async fetch(collectionName: string) {

    const localResult = await this.storage.fetch(collectionName);
    if (localResult) {
      return localResult;
    }


    this.busy.emit(true);
    await this.connect();

    console.log('FireService::fetch')

    try {
      const ref = this.db.collection(collectionName);
      const result = await ref.get();

      const collectionData = [];
      result.forEach((item) => { collectionData.push(Object.assign(item.data(), { id: item.id })) })



      await this.storage.bulkPut(collectionName, collectionData);
      this.busy.emit(false);
      return collectionData;
    } catch (error) {

      console.log(error);
    }

  }

  async add(collectionName: string, doc: any) {
    console.log('FireService::add')
    this.busy.emit(true);
    await this.connect();
    const result = await this.db.collection(collectionName).add(doc);

    await this.storage.add(collectionName, doc);
    this.busy.emit(false);
    return result.data;
  }

  async update(collectionName: string, id: string, doc: any) {
    await this.connect();
    this.busy.emit(true);
    const ref = this.db.collection(collectionName).doc(id);
    try {

      await ref.update(Object.assign(doc, { timestamp: this.firebase.firestore.FieldValue.serverTimestamp() }));

      await this.storage.put(collectionName, doc);

      this.busy.emit(false);
      return true;
    } catch (error) {
      console.log(error)
      return false;
    }

  }

  async remove(collectionName: string, id: string) {
    console.log('FireService::remove')
    this.busy.emit(true);
    await this.connect();

    const result = await this.db.collection(collectionName).doc(id).delete();

    await this.storage.remove(collectionName, id);

    this.busy.emit(false);

  }



  async sync() {

  }
}
