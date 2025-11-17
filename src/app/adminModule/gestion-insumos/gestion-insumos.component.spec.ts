import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionInsumosComponent } from './gestion-insumos.component';

describe('GestionInsumosComponent', () => {
  let component: GestionInsumosComponent;
  let fixture: ComponentFixture<GestionInsumosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionInsumosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionInsumosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
