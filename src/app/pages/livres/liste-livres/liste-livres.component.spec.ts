import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeLivresComponent } from './liste-livres.component';

describe('ListeLivresComponent', () => {
  let component: ListeLivresComponent;
  let fixture: ComponentFixture<ListeLivresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeLivresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListeLivresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
