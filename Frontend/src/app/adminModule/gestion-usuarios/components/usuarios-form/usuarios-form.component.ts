import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sucursal } from '../../../../shared/models/sucursal.model';

@Component({
  selector: 'app-usuarios-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-form.component.html',
  styleUrl: './usuarios-form.component.css'
})
export class UsuariosFormComponent {
  @Input() showModal: boolean = false;
  @Input() usuarioToEdit: any | null = null; // Si es null, es creación
  @Input() sucursales: Sucursal[] = [];
  
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  usuarioForm: FormGroup;
  isEditing: boolean = false;

  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], 
      rol: ['gerente', Validators.required],
      sucursal_id: [null]
    });
  }

  // Detecta cambios en los Inputs (cuando el padre manda un usuario a editar)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioToEdit'] && this.showModal) {
      if (this.usuarioToEdit) {
        this.isEditing = true;
        this.usuarioForm.patchValue(this.usuarioToEdit);
        this.usuarioForm.get('password')?.clearValidators();
      } else {
        this.isEditing = false;
        this.usuarioForm.reset({ rol: 'gerente' });
        this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  submit() {
    if (this.usuarioForm.invalid) return;

    const formData = this.usuarioForm.value;

    // Validación manual de sucursal
    if (formData.rol === 'gerente' && !formData.sucursal_id) {
      alert('Debes seleccionar una sucursal para el rol de Gerente');
      return;
    }

    this.onSave.emit(formData);
  }

  cancel() {
    this.onCancel.emit();
  }
}
