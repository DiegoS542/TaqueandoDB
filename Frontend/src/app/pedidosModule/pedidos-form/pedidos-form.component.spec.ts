import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosFormComponent } from './pedidos-form.component';

describe('PedidosFormComponent', () => {
  let component: PedidosFormComponent;
  let fixture: ComponentFixture<PedidosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
