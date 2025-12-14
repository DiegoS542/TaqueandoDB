import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { InsumosService } from '../../adminModule/services/insumos.service';
import { PedidosService } from '../../adminModule/services/pedidos.service';

@Component({
  selector: 'app-pedidos-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos-form.component.html',
  styleUrl: './pedidos-form.component.css'
})
export class PedidoFormComponent {
  // Recibimos la Sucursal obligatoriamente desde el Padre
  @Input() sucursalId!: number; 
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  form: FormGroup;
  insumosCatalogo: any[] = [];
  totalEstimado = 0;

  constructor(
    private fb: FormBuilder,
    private pedidosService: PedidosService,
    private insumosService: InsumosService
  ) {
    this.form = this.fb.group({
      items: this.fb.array([]) // Iniciamos vacío
    });
  }

  ngOnInit() {
    // Cargamos el catálogo de insumos (que ya trae proveedores anidados gracias a la VISTA SQL)
    this.insumosService.getInsumos().subscribe(data => {
      this.insumosCatalogo = data;
      this.addItem(); // Agregamos la primera fila vacía por cortesía
    });
  }

  // Helper para acceder al Array en el HTML
  get itemsArray() {
    return this.form.get('items') as FormArray;
  }

  // --- LÓGICA DEL CARRITO ---

  addItem() {
    const itemGroup = this.fb.group({
      insumo_obj: [null, Validators.required],     // Objeto completo del insumo
      proveedor_info: [null, Validators.required], // Objeto del proveedor seleccionado
      cantidad: [1, [Validators.required, Validators.min(0.1)]]
    });

    // Suscribirse a cambios para recalcular el total en tiempo real
    itemGroup.valueChanges.subscribe(() => this.calcularTotal());

    this.itemsArray.push(itemGroup);
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
    this.calcularTotal();
  }

  calcularTotal() {
    // Recorremos el formulario sumando (Precio * Cantidad)
    this.totalEstimado = this.itemsArray.controls.reduce((acc, control) => {
      const val = control.value;
      if (val.proveedor_info && val.cantidad) {
        return acc + (val.proveedor_info.precio_compra * val.cantidad);
      }
      return acc;
    }, 0);
  }

  // --- GUARDADO ---

  submit() {
    if (this.form.invalid) return;
    if (this.itemsArray.length === 0) {
      alert('El pedido está vacío.');
      return;
    }

    // Transformamos los objetos del formulario al formato que pide la API
    const payload = {
      sucursal_id: this.sucursalId,
      items: this.form.value.items.map((i: any) => ({
        insumo_id: i.insumo_obj.insumo_id,
        proveedor_id: i.proveedor_info.proveedor_id,
        cantidad: i.cantidad,
        precio: i.proveedor_info.precio_compra // Enviamos precio para histórico
      }))
    };

    this.pedidosService.createPedido(payload).subscribe({
      next: () => {
        alert('Pedido creado exitosamente');
        this.onSave.emit(); // Avisamos al padre para que recargue la tabla
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear el pedido');
      }
    });
  }

  cancel() {
    this.onClose.emit();
  }
}
