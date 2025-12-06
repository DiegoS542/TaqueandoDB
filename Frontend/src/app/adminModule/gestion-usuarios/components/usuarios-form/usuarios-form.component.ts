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
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', Validators.maxLength(50)], 
      rol: ['gerente', Validators.required],
      sucursal_id: [null]
    });
  }

  // Configuramos la validación dinámica al iniciar
  ngOnInit(): void {
    this.setupSucursalValidation();
  }

  // Detecta cambios en los Inputs (cuando el padre manda un usuario a editar)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioToEdit']) {
      if (this.usuarioToEdit) {
        // --- MODO EDICIÓN ---
        this.isEditing = true;
        this.usuarioForm.patchValue(this.usuarioToEdit);
        this.usuarioForm.get('password')?.setValue('');
        this.usuarioForm.get('password')?.setValidators([Validators.minLength(6)]);
      } else {
        // --- MODO CREACIÓN --
        this.isEditing = false;
        this.usuarioForm.reset({ rol: 'gerente' });
        this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      // FORZAR la actualización de las reglas
      this.usuarioForm.get('password')?.updateValueAndValidity();
      this.actualizarValidacionSucursal();
    }
  }

  // Esta función "escucha" cambios en el campo 'rol'
  setupSucursalValidation() {
    this.usuarioForm.get('rol')?.valueChanges.subscribe(rol => {
      const sucursalControl = this.usuarioForm.get('sucursal_id');
      
      if (rol === 'gerente') {
        // Si es gerente, la sucursal es OBLIGATORIA
        sucursalControl?.setValidators([Validators.required]);
      } else {
        // Si no, NO es obligatoria y se debe limpiar
        sucursalControl?.clearValidators();
        sucursalControl?.setValue(null); // Opcional: limpiar el valor si cambia de rol
      }
      // Recalcular la validez del campo
      sucursalControl?.updateValueAndValidity();
    });
  }

  // Lógica centralizada para validar sucursal
  actualizarValidacionSucursal() {
    const rol = this.usuarioForm.get('rol')?.value;
    const sucursalControl = this.usuarioForm.get('sucursal_id');

    if (rol === 'gerente') {
      // Si es gerente, PONER Required
      sucursalControl?.setValidators([Validators.required]);
    } else {
      // Si no, QUITAR Required
      sucursalControl?.clearValidators();
      sucursalControl?.setValue(null); // Limpiar selección si cambia de rol
    }
    // Aplicar cambios
    sucursalControl?.updateValueAndValidity();
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
    this.usuarioForm.reset({ rol: 'gerente' });
    this.isEditing = false;
    this.onCancel.emit();
  }
}
