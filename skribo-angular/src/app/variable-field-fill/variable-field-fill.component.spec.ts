import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableFieldFillComponent } from './variable-field-fill.component';

describe('VariableFieldFillComponent', () => {
  let component: VariableFieldFillComponent;
  let fixture: ComponentFixture<VariableFieldFillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariableFieldFillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableFieldFillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
