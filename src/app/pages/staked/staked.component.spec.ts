import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakedComponent } from './staked.component';

describe('FoundersComponent', () => {
  let component: StakedComponent;
  let fixture: ComponentFixture<StakedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
