import { Component, OnInit } from '@angular/core';
import { FireService } from '../fire.service';
import { Scripts } from '@skribo/client';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']

})
export class ManageComponent implements OnInit {

  constructor(public fireService: FireService) { }
  collectionData: any = [];
  async ngOnInit() {
    await this.list();
  }
  async list() {
    this.collectionData = await Scripts.list();
    //this.collectionData = await this.fireService.fetch('Script');
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
    // {
    //   title: 'Position',
    //   name: 'position',
    //   sort: false,
    //   filtering: { filterString: '', placeholder: 'Filter by position' }
    // },
    // { title: 'Office', className: ['office-header', 'text-success'], name: 'office', sort: 'asc' },
    // { title: 'Extn.', name: 'ext', sort: '', filtering: { filterString: '', placeholder: 'Filter by extn.' } },
    // { title: 'Start date', className: 'text-warning', name: 'startDate' },
    // { title: 'Salary ($)', name: 'salary' }
  ];

}
