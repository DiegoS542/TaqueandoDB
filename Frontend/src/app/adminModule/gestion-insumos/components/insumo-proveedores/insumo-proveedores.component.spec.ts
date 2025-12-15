import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsumoProveedoresComponent } from './insumo-proveedores.component';

describe('InsumoProveedoresComponent', () => {
  let component: InsumoProveedoresComponent;
  let fixture: ComponentFixture<InsumoProveedoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsumoProveedoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsumoProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
