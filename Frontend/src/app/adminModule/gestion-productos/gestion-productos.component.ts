import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../services/productos.service'; 
import { ProductosListComponent } from './components/productos-list/productos-list.component';
import { ProductosFormComponent } from './components/productos-form/productos-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, ProductosListComponent, ProductosFormComponent,ReactiveFormsModule],
  templateUrl: './gestion-productos.component.html',
  styleUrls: ['./gestion-productos.component.css']
})
export class GestionProductosComponent implements OnInit {

  productos: any[] = [];
  isLoading = true;
  showModal = false;
  productoToEdit: any | null = null;

  constructor(private productosService: ProductosService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  handleCreate() {
    this.productoToEdit = null;
    this.showModal = true;
  }

  handleEdit(item: any) {
    this.productoToEdit = item;
    this.showModal = true;
  }

  handleSave(payload: any) {
    if (this.productoToEdit) {
      this.productosService.updateProducto(this.productoToEdit.producto_id, payload)
        .subscribe(() => {
          this.closeModal();
          this.loadData();
        });
    } else {
      this.productosService.createProducto(payload)
        .subscribe(() => {
          this.closeModal();
          this.loadData();
        });
    }
  }

  handleDelete(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.productosService.deleteProducto(id)
        .subscribe(() => this.loadData());
    }
  }

  closeModal() {
    this.showModal = false;
    this.productoToEdit = null;
  }
}
