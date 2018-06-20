import { Component, OnInit } from '@angular/core';
import { FireService } from '../fire.service';
import { Scripts } from '@skribo/client';
import { UserService } from '../user.context.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']

})
export class ManageComponent implements OnInit {
  user: any;
  constructor(private userService: UserService) {

    this.user = userService.getUser();

  }
  collectionData: any = [];


  async ngOnInit() {
    await this.list();
  }
  async list() {
    this.collectionData = await Scripts.list(this.user.id);
    //this.collectionData = await this.fireService.fetch('Script');
  }


  

  async spreadsheet(id: number) {
    try {
      await Scripts.remove(id);
    } catch (error) {
      console.error(error);
    }
  }



  async remove(id: number) {
    try {
      await Scripts.remove(id);
    } catch (error) {
      console.error(error);
    }

  }


  public tableColumns = [
    { title: 'Name', name: 'name', sort: 'asc', filtering: { filterString: '', placeholder: 'Filter by name' } },
    { title: '#ID', name: 'id', sort: 'asc', filtering: { filterString: '', placeholder: 'Filter by id' } }

  ];

}
