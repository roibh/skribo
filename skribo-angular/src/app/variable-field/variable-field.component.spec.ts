import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableFieldComponent } from './variable-field.component';

describe('VariableFieldComponent', () => {
  let component: VariableFieldComponent;
  let fixture: ComponentFixture<VariableFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
