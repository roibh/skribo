import { Injectable, Output, EventEmitter } from '@angular/core';
import Dexie from 'dexie';
import { debug } from 'util';



@Injectable()
export class StorageService {

  config = {
    name: 'Skribo'
  };
  storage: any;
  db: Dexie;

  @Output()
  busy: EventEmitter<boolean> = new EventEmitter<boolean>();

  Script: Dexie.Table<IScript, string>;
  constructor() {
    this.db = new Dexie('Skribo', {  autoOpen: true });


    this.db.version(1).stores({
      Script: '&id,name,code,variables'
    });
   
  }

  public async remove(collectionName: string, id: string) {
    if (!this.db[collectionName]) {
      return null;
    }

    const result = await this.db.table(collectionName).where('id').equals(id).delete();
    if (result) {
      return result;
    }
    return null;
  }


  public async get(collectionName: string, id: string) {
    if (!this.db[collectionName]) {
      return null;
    }

    const result = await this.db.table(collectionName).where('id').equals(id).first();
    if (result) {
      return result;
    }
    return null;
  }

  public async fetch(collectionName: string) {

    if (!this.db[collectionName]) {
      return null;
    }
    const result = await this.db[collectionName].toArray();
    if (result.length > 0) {
      return result;
    }
    return null;
  }

  public async add(collectionName: string, doc: any) {
    return await this.db[collectionName].add(doc, doc.id);
  }


  public async put(collectionName: string, doc: any) {
    return await this.db[collectionName].put(doc);
  }




  public async bulkPut(collectionName: string, data: any) {

    return await this.db.table(collectionName).bulkAdd(data);
  }


}
export interface IScript {
  name: string;
  code: string;
  variables: { name: string, value: any }
}
