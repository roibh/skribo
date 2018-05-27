import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdScriptComponent } from './ad-script.component';

describe('AdScriptComponent', () => {
  let component: AdScriptComponent;
  let fixture: ComponentFixture<AdScriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdScriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
