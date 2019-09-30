import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MsigComponent } from './msig.component';

describe('MsigComponent', () => {
  let component: MsigComponent;
  let fixture: ComponentFixture<MsigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
