import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsumosService } from '../services/insumos.service';
import { ProveedoresService } from '../services/proveedores.service';
import { InsumosListComponent } from './components/insumos-list/insumos-list.component';
import { Proveedor } from '../../shared/models/proveedor.model';
import { InsumoFormComponent } from './components/insumos-form/insumos-form.component';

@Component({
  selector: 'app-gestion-insumos',
  standalone: true,
  imports: [CommonModule, InsumosListComponent, InsumoFormComponent],
  templateUrl: './gestion-insumos.component.html',
  styleUrls: ['./gestion-insumos.component.css']
})
export class GestionInsumosComponent implements OnInit {
  
  insumos: any[] = [];
  allProveedores: Proveedor[] = [];
  
  isLoading = true;
  showModal = false;
  insumoToEdit: any | null = null;

  constructor(
    private insumosService: InsumosService,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // 1. Cargar Insumos
    this.insumosService.getInsumos().subscribe({
      next: (data) => {
        this.insumos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });

    // 2. Cargar Proveedores (para tenerlos listos cuando abran el modal)
    // Solo cargamos si la lista está vacía para no saturar
    if (this.allProveedores.length === 0) {
      this.proveedoresService.getProveedores().subscribe(data => {
        this.allProveedores = data;
      });
    }
  }

  // --- ACCIONES DEL USUARIO ---

  handleCreate() {
    this.insumoToEdit = null;
    this.showModal = true;
  }

  handleEdit(item: any) {
    this.insumoToEdit = item;
    this.showModal = true;
  }

  handleSave(payload: any) {
    if (this.insumoToEdit) {
      // EDITAR
      this.insumosService.updateInsumo(this.insumoToEdit.insumo_id, payload).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    } else {
      // CREAR
      this.insumosService.createInsumo(payload).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    }
  }

  handleDelete(id: number) {
    if (confirm('¿Estás seguro de eliminar este insumo?')) {
      this.insumosService.deleteInsumo(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar (ver consola)')
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.insumoToEdit = null;
  }
}