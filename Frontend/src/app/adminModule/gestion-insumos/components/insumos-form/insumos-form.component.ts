import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// 👇 IMPORTAMOS EL HIJO
import { InsumoProveedoresComponent } from '../insumo-proveedores/insumo-proveedores.component';
import { Proveedor } from '../../../../shared/models/proveedor.model';

@Component({
  selector: 'app-insumo-form',
  standalone: true,
  // 👇 LO AGREGAMOS AQUÍ PARA PODER USARLO EN EL HTML
  imports: [CommonModule, ReactiveFormsModule, InsumoProveedoresComponent],
  templateUrl: './insumos-form.component.html',
  styleUrls: ['./insumos-form.component.css']
})
export class InsumoFormComponent implements OnChanges {
  @Input() showModal = false;
  @Input() insumoToEdit: any | null = null;
  
  // Necesitamos la lista completa para pasársela al hijo
  @Input() allProveedores: Proveedor[] = []; 
  
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  insumoForm: FormGroup;
  isEditing = false;
  
  // Esta lista vive aquí, pero la gestiona el hijo visualmente
  proveedoresAsignados: any[] = []; 

  constructor(private fb: FormBuilder) {
    this.insumoForm = this.fb.group({
      // Agregamos Validators.maxLength(100)
      nombre: ['', [Validators.required, Validators.maxLength(20)]], 
      unidad_medida: ['Kg', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const modalChange = changes['showModal'];
    
    // Solo actuamos si el modal se abre
    if (modalChange && modalChange.currentValue === true) {
      if (this.insumoToEdit) {
        // --- MODO EDICIÓN ---
        this.isEditing = true;
        this.insumoForm.patchValue({
          nombre: this.insumoToEdit.nombre,
          unidad_medida: this.insumoToEdit.unidad_medida
        });

        // CARGAMOS LOS PROVEEDORES EXISTENTES
        // Usamos [...] para romper la referencia y no modificar los datos originales en tiempo real
        // Si insumoToEdit.proveedores es null (porque viene de la BD vacío), usamos []
        this.proveedoresAsignados = [...(this.insumoToEdit.proveedores || [])];

      } else {
        // --- MODO CREACIÓN ---
        this.isEditing = false;
        this.insumoForm.reset({ unidad_medida: 'Kg' });
        this.proveedoresAsignados = []; // Empezamos limpios
      }
    }
  }

  submit() {
    if (this.insumoForm.invalid) return;

    // ARMAMOS EL PAQUETE FINAL
    const payload = {
      ...this.insumoForm.value, // Nombre y Unidad
      proveedores: this.proveedoresAsignados // Array de relaciones (puede ir vacío)
    };

    this.onSave.emit(payload);
  }

  cancel() {
    this.onCancel.emit();
  }
}