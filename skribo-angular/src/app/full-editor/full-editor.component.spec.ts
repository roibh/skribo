import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullEditorComponent } from './full-editor.component';

describe('FullEditorComponent', () => {
  let component: FullEditorComponent;
  let fixture: ComponentFixture<FullEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
