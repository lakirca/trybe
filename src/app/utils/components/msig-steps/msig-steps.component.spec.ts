import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsigStepsComponent } from './msig-steps.component';

describe('MsigStepsComponent', () => {
  let component: MsigStepsComponent;
  let fixture: ComponentFixture<MsigStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsigStepsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsigStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
