import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedoresService } from '../services/proveedores.service';
import { Proveedor } from '../../shared/models/proveedor.model';

@Component({
  selector: 'app-gestion-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-proveedores.component.html',
  styleUrls: ['./gestion-proveedores.component.css']
})
export class GestionProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  form: FormGroup;
  showModal = false;
  isEditing = false;
  currentId: number | null = null;
  isLoading = true;
  showInsumosModal = false;
  insumosList: any[] = [];
  selectedProveedorName = '';
  isLoadingInsumos = false;

  constructor(private service: ProveedoresService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre_empresa: ['', Validators.required],
      contacto: ['', Validators.required]
    });
  }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading = true;
    this.service.getProveedores().subscribe({
      next: (data) => { this.proveedores = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openModal(prov?: Proveedor) {
    this.showModal = true;
    if (prov) {
      this.isEditing = true;
      this.currentId = prov.proveedor_id!;
      this.form.patchValue(prov);
    } else {
      this.isEditing = false;
      this.currentId = null;
      this.form.reset();
    }
  }

  submit() {
    if (this.form.invalid) return;
    const data = this.form.value;

    if (this.isEditing && this.currentId) {
      this.service.updateProveedor(this.currentId, data).subscribe(() => {
        this.closeModal(); this.loadData();
      });
    } else {
      this.service.createProveedor(data).subscribe(() => {
        this.closeModal(); this.loadData();
      });
    }
  }

  delete(id: number) {
    if (confirm('¿Borrar proveedor?')) {
      this.service.deleteProveedor(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert(err.error.error || 'No se pudo eliminar')
      });
    }
  }

  viewInsumos(prov: Proveedor) {
    // Si tiene 0 insumos, no hacemos nada (o podrías mostrar un alert)
    if (!prov.total_insumos_surtidos || prov.total_insumos_surtidos === 0) return;

    this.selectedProveedorName = prov.nombre_empresa;
    this.showInsumosModal = true;
    this.isLoadingInsumos = true;
    this.insumosList = []; // Limpiar anterior

    this.service.getInsumosByProveedor(prov.proveedor_id!).subscribe({
      next: (data) => {
        this.insumosList = data;
        this.isLoadingInsumos = false;
      },
      error: () => {
        alert('Error al cargar insumos');
        this.showInsumosModal = false;
      }
    });
  }

  closeInsumosModal() {
    this.showInsumosModal = false;
    this.insumosList = [];
  }

  closeModal() { this.showModal = false; }
}