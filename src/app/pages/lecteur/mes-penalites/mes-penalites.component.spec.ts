import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesPenalitesComponent } from './mes-penalites.component';

describe('MesPenalitesComponent', () => {
  let component: MesPenalitesComponent;
  let fixture: ComponentFixture<MesPenalitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesPenalitesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesPenalitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
