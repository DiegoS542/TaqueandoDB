import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { InsumosService } from '../../adminModule/services/insumos.service';
import { PedidosService } from '../../adminModule/services/pedidos.service';

@Component({
  selector: 'app-pedidos-form',
  standalone: true, // Asumo que es standalone por tus imports
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos-form.component.html',
  styleUrl: './pedidos-form.component.css'
})
export class PedidoFormComponent implements OnInit {
  
  @Input() sucursalId!: number;
  @Input() pedidoEditar: any | null = null; 
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  form: FormGroup;
  insumosCatalogo: any[] = [];
  totalEstimado = 0;

  // Variable para asegurar que tenemos el ID correcto (pedido_id vs id)
  currentPedidoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private pedidosService: PedidosService,
    private insumosService: InsumosService
  ) {
    this.form = this.fb.group({
      items: this.fb.array([]) 
    });
  }

  get itemsArray() {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    // 1. Cargar catálogo de insumos (necesario para los selects)
    this.insumosService.getInsumos().subscribe(data => {
      this.insumosCatalogo = data;

      // 2. Determinar si es EDICIÓN o CREACIÓN
      if (this.pedidoEditar) {
        // Normalizamos el ID: A veces viene como 'id', a veces como 'pedido_id'
        this.currentPedidoId = this.pedidoEditar.pedido_id || this.pedidoEditar.id;
        
        console.log("Modo Edición - ID:", this.currentPedidoId);

        // 3. Importante: Vamos al Backend a buscar los detalles frescos
        if (this.currentPedidoId) {
          this.cargarDatosEdicion(this.currentPedidoId);
        }
      } else {
        // Modo Creación
        this.currentPedidoId = null;
        this.addItem(); // Agregamos fila vacía por defecto
      }
    });
  }

  // --- LÓGICA DE CARGA DE DATOS (NUEVO) ---
  cargarDatosEdicion(id: number) {
  this.pedidosService.getDetallePedido(id).subscribe({
    next: (detalles) => {
      if (!detalles || detalles.length === 0) {
        this.addItem();
        return;
      }

      detalles.forEach((item: any) => {
        // CASO A: El insumo fue ELIMINADO o es Histórico
        // (La vista devuelve 'Eliminado' o el ID viene nulo)
        if (item.estado_registro === 'Eliminado' || !item.insumo_id) {
          
          const itemGroup = this.fb.group({
            // Marcamos flags especiales para el HTML
            es_eliminado: [true], 
            nombre_display: [item.insumo_nombre], // Texto original (ej. "Tomate (ELIMINADO)")
            proveedor_display: [item.nombre_empresa],
            precio_display: [item.precio_unitario_compra],
            
            // Los controles normales los dejamos en null o con valores base
            insumo_obj: [null], 
            proveedor_info: [null],
            cantidad: [{ value: Number(item.cantidad), disabled: true }] // Deshabilitado para que no lo editen
          });

          this.itemsArray.push(itemGroup);

        } else {
          // CASO B: Es un insumo ACTIVO (Lógica normal que ya tenías)
          const insumoIdBD = Number(item.insumo_id);
          const proveedorIdBD = Number(item.proveedor_id);

          const insumoEncontrado = this.insumosCatalogo.find(ins => ins.insumo_id == insumoIdBD);
          const proveedorEncontrado = insumoEncontrado?.proveedores?.find((p: any) => p.proveedor_id == proveedorIdBD);

          if (insumoEncontrado && proveedorEncontrado) {
            const itemGroup = this.fb.group({
              es_eliminado: [false], // Flag activo
              insumo_obj: [insumoEncontrado, Validators.required],
              proveedor_info: [proveedorEncontrado, Validators.required],
              cantidad: [Number(item.cantidad), [Validators.required, Validators.min(0.1)]]
            });
            itemGroup.valueChanges.subscribe(() => this.calcularTotal());
            this.itemsArray.push(itemGroup);
          }
        }
      });
      this.calcularTotal();
    },
    error: (err) => { console.error(err); this.addItem(); }
  });
}

  // --- LÓGICA DEL FORMULARIO (Mantiene igual) ---

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
    const val = control.value; // .value solo trae campos habilitados
    const rawVal = control.getRawValue(); // .getRawValue trae todo (incluso lo disabled)

    if (rawVal.es_eliminado) {
      // Si es eliminado, usamos el precio histórico display
      return acc + (rawVal.precio_display * rawVal.cantidad);
    } else {
      // Si es activo, usamos el objeto proveedor
      if (val.proveedor_info && val.cantidad) {
        return acc + (val.proveedor_info.precio_compra * val.cantidad);
      }
    }
    return acc;
  }, 0);
}

  // --- SUBMIT (CORREGIDO PARA USAR EL STORED PROCEDURE) ---

  submit() {
    if (this.form.invalid) return;

    // FILTRO: Solo enviamos al backend los items ACTIVOS (que tienen insumo_id válido)
    // Los eliminados se "pierden" de la edición actual porque no se pueden re-insertar
    const itemsValidos = this.form.getRawValue().items.filter((i: any) => !i.es_eliminado && i.insumo_obj);

    if (itemsValidos.length === 0) {
      alert('El pedido debe tener al menos un insumo activo.');
      return;
    }

    const itemsPayload = itemsValidos.map((i: any) => ({
        insumo_id: i.insumo_obj.insumo_id,
        proveedor_id: i.proveedor_info.proveedor_id,
        cantidad: i.cantidad,
        precio: i.proveedor_info.precio_compra 
    }));

    const payload = {
      sucursal_id: this.sucursalId,
      items: itemsPayload
    };

    // DECISIÓN: ¿Editar o Crear?
    if (this.currentPedidoId) {
      // --- ACTUALIZAR (PUT) ---
      this.pedidosService.updatePedido(this.currentPedidoId, payload).subscribe({
        next: () => {
            alert('Pedido actualizado con éxito');
            this.onSave.emit();
            this.onClose.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar');
        }
      });

    } else {
      // --- CREAR (POST) ---
      this.pedidosService.createPedido(payload).subscribe({
        next: () => {
          this.onSave.emit();
          this.onClose.emit();
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