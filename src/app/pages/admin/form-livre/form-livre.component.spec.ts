import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLivreComponent } from './form-livre.component';

describe('FormLivreComponent', () => {
  let component: FormLivreComponent;
  let fixture: ComponentFixture<FormLivreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLivreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormLivreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
