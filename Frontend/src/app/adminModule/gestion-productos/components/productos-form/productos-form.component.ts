import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos-form.component.html',
  styleUrls: ['./productos-form.component.css']
})
export class ProductosFormComponent implements OnChanges {

  @Input() showModal = false;
  @Input() productoToEdit: any | null = null;

  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  productoForm!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.productoToEdit) {
      this.isEditing = true;
      this.productoForm.patchValue(this.productoToEdit);
    } else {
      this.isEditing = false;
      this.productoForm.reset();
    }
  }

  private initForm() {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: [''],
      precio_venta: [0, [Validators.required, Validators.min(0.01)]],
      categoria: [''],
      activo: [true]
    });
  }

  submit() {
    if (this.productoForm.valid) {
      this.onSave.emit(this.productoForm.value);
    }
  }

  cancel() {
    this.onCancel.emit();
    this.productoForm.reset();
  }
}
