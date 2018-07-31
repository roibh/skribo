import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablesFillComponent } from './variables-fill.component';

describe('VariablesFillComponent', () => {
  let component: VariablesFillComponent;
  let fixture: ComponentFixture<VariablesFillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariablesFillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablesFillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
