import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLivresComponent } from './gestion-livres.component';

describe('GestionLivresComponent', () => {
  let component: GestionLivresComponent;
  let fixture: ComponentFixture<GestionLivresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionLivresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionLivresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
