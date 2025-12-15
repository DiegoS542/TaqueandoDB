import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../services/inventario.service';
import { Insumo } from '../../shared/models/insumo.model';
import { ApiResponse } from '../../shared/models/ApiResponse.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  insumos: Insumo[] = [];
  sucursales: any[] = [];

  inventarioForm: FormGroup;
  inventarioId: number | null = null;

  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService
  ) {
    this.inventarioForm = this.fb.group({
      sucursalId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarInsumos();
    this.cargarSucursales();
  }

  /* =========================
     CARGAS
     ========================= */

  cargarInsumos(): void {
    this.isLoading = true;

    this.inventarioService.listarInsumos().subscribe({
      next: (res) => {
        this.insumos = res.data.map((i) => ({
          ...i,
          cantidad: 0,
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  cargarSucursales(): void {
    const rol = localStorage.getItem('rol');
    const sucursalUsuario = Number(localStorage.getItem('sucursal_id'));

    this.inventarioService.cargarSucursales().subscribe({
      next: (res) => {
        this.sucursales = res;

        if (rol === 'GERENTE') {
          this.inventarioForm.patchValue({
            sucursalId: sucursalUsuario,
          });
          this.inventarioForm.get('sucursalId')?.disable();
        }
      },
    });
  }

  /* =========================
     CREAR INVENTARIO
     ========================= */

  crearInventario(): void {
    if (this.inventarioForm.invalid) {
      this.inventarioForm.markAllAsTouched();
      return;
    }

    const sucursalId = this.inventarioForm.value.sucursalId;

    this.inventarioService.crearInventario(sucursalId).subscribe({
      next: (res) => {
        this.inventarioId = res.inventario_id;
      },
      error: () => alert('Error al crear inventario'),
    });
  }

  /* =========================
     VALIDACIONES FRONT
     ========================= */

  hayCantidadesValidas(): boolean {
    return this.insumos.some(
      (i) => typeof i.cantidad === 'number' && i.cantidad > 0
    );
  }

  /* =========================
     GUARDAR DETALLE
     ========================= */

  guardarDetalle(): void {
    if (!this.inventarioId) return;

    const detalles = this.insumos
      .filter((i) => i.cantidad && i.cantidad > 0)
      .map((i) => ({
        insumo_id: i.insumo_id,
        cantidad: i.cantidad!,
      }));

    if (detalles.length === 0) {
      alert('Debes capturar al menos un insumo');
      return;
    }

    this.inventarioService
      .guardarDetalle(this.inventarioId, detalles)
      .subscribe({
        next: () => alert('Inventario guardado correctamente'),
        error: () => alert('Error al guardar inventario'),
      });
  }
}
