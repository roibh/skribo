import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadsheetComponent } from './spreadsheet.component';

describe('SpreadsheetComponent', () => {
  let component: SpreadseetComponent;
  let fixture: ComponentFixture<SpreadseetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpreadseetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
