import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
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
  
  @Input() sucursalId!: number;
  // 1. NUEVO: Recibimos el pedido a editar (puede ser null si es nuevo)
  @Input() pedidoEditar: any | null = null; 
  
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
      items: this.fb.array([]) 
    });
  }

  ngOnInit() {
    // 2. MODIFICADO: Primero cargamos el catálogo, LUEGO decidimos si llenamos o iniciamos vacío
    this.insumosService.getInsumos().subscribe(data => {
      this.insumosCatalogo = data;

      if (this.pedidoEditar) {
        // Si hay un pedido para editar, llenamos el form con sus datos
        this.cargarDatosEdicion();
      } else {
        // Si es nuevo, agregamos la fila vacía por defecto
        this.addItem(); 
      }
    });
  }

  // Helper para acceder al Array
  get itemsArray() {
    return this.form.get('items') as FormArray;
  }

  // --- LÓGICA DE EDICIÓN (NUEVO) ---

  cargarDatosEdicion() {
    // Asumimos que pedidoEditar tiene una propiedad 'detalles' o 'items'
    // que es un array con { insumo_id, proveedor_id, cantidad, ... }
    const itemsDelPedido = this.pedidoEditar.items || []; 

    itemsDelPedido.forEach((item: any) => {
      
      // TRUCO: Buscar el objeto COMPLETO en el catálogo usando el ID
      // Esto es necesario para que el <select> reconozca el valor seleccionado
      const insumoEncontrado = this.insumosCatalogo.find(ins => ins.insumo_id === item.insumo_id);
      
      // Buscar el proveedor dentro de ese insumo (o en tu catálogo general de proveedores)
      // Ajusta 'proveedores' según cómo venga tu estructura desde la VISTA SQL
      const proveedorEncontrado = insumoEncontrado?.proveedores?.find((p: any) => p.proveedor_id === item.proveedor_id);

      if (insumoEncontrado && proveedorEncontrado) {
        const itemGroup = this.fb.group({
          insumo_obj: [insumoEncontrado, Validators.required],
          proveedor_info: [proveedorEncontrado, Validators.required], 
          cantidad: [item.cantidad, [Validators.required, Validators.min(0.1)]]
        });

        // Suscribirse a cambios igual que en addItem
        itemGroup.valueChanges.subscribe(() => this.calcularTotal());
        
        this.itemsArray.push(itemGroup);
      }
    });

    // Calcular el total inicial con los datos cargados
    this.calcularTotal();
  }

  // --- LÓGICA DEL CARRITO (IGUAL) ---

  addItem() {
    const itemGroup = this.fb.group({
      insumo_obj: [null, Validators.required], 
      proveedor_info: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.1)]]
    });

    itemGroup.valueChanges.subscribe(() => this.calcularTotal());
    this.itemsArray.push(itemGroup);
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalEstimado = this.itemsArray.controls.reduce((acc, control) => {
      const val = control.value;
      if (val.proveedor_info && val.cantidad) {
        // Asegúrate que la propiedad sea precio_compra o precio (según tu DB)
        return acc + (val.proveedor_info.precio_compra * val.cantidad);
      }
      return acc;
    }, 0);
  }

  // --- GUARDADO (MODIFICADO) ---

  submit() {
    if (this.form.invalid) return;
    if (this.itemsArray.length === 0) {
      alert('El pedido está vacío.');
      return;
    }

    const itemsPayload = this.form.value.items.map((i: any) => ({
        insumo_id: i.insumo_obj.insumo_id, // Ajusta nombres de ID según tu DB
        proveedor_id: i.proveedor_info.proveedor_id,
        cantidad: i.cantidad,
        precio: i.proveedor_info.precio_compra 
    }));

    const payload = {
      sucursal_id: this.sucursalId,
      items: itemsPayload
    };

    if (this.pedidoEditar) {
      // 3. EDITAR: Llamamos al update
      // Asumimos que pedidoEditar tiene el ID del pedido principal
      this.pedidosService.updatePedido(this.pedidoEditar.id, payload).subscribe({
        next: () => {
            this.onSave.emit();
            this.onClose.emit();
        },
        error: (err) => alert('Error al actualizar')
      });

    } else {
      // 4. CREAR: Lo que ya tenías
      this.pedidosService.createPedido(payload).subscribe({
        next: () => {
          this.onSave.emit();
          this.onClose.emit(); // Cerramos también al guardar
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear el pedido');
        }
      });
    }
  }

  cancel() {
    this.onClose.emit();
  }
}