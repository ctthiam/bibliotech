import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesEmpruntsComponent } from './mes-emprunts.component';

describe('MesEmpruntsComponent', () => {
  let component: MesEmpruntsComponent;
  let fixture: ComponentFixture<MesEmpruntsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MesEmpruntsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesEmpruntsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
