import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../services/ventas.service';
import { ProductosService, Producto } from '../../adminModule/services/productos.service';

// --- CORRECCIÓN AQUÍ ---
import { AuthService } from '../../core/services/auth.service'; 
import { Usuario } from '../../shared/models/usuario.model'; 

@Component({
  selector: 'app-registro-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-venta.component.html',
  styleUrls: ['./registro-venta.component.css']
})
export class RegistroVentaComponent implements OnInit {

  productosDisponibles: Producto[] = [];
  productosFiltrados: Producto[] = [];
  carrito: any[] = [];
  totalVenta: number = 0;

  // Variables de usuario
  sucursalIdActual: number | null = null;
  usuarioIdActual: number | null = null;
  nombreVendedor: string = '';

  constructor(
    private ventasService: VentasService,
    private productosService: ProductosService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.obtenerDatosUsuario();
  }

  obtenerDatosUsuario() {
    const usuario: Usuario | null = this.authService.getCurrentUser();

    if (usuario) {
      // Mapeamos las propiedades de tu interfaz Usuario
      this.usuarioIdActual = usuario.id;
      this.sucursalIdActual = usuario.sucursalId;
      this.nombreVendedor = usuario.nombre;
      
      console.log('✅ Vendedor:', this.nombreVendedor);
      console.log('✅ Sucursal ID:', this.sucursalIdActual);
    } else {
      console.warn('⚠️ No hay usuario logueado');
    }
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productosDisponibles = data;
        this.productosFiltrados = data;
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  filtrarProductos(texto: string) {
    if (!texto) {
      this.productosFiltrados = this.productosDisponibles;
    } else {
      texto = texto.toLowerCase();
      this.productosFiltrados = this.productosDisponibles.filter(p => 
        p.nombre.toLowerCase().includes(texto) || 
        p.categoria.toLowerCase().includes(texto)
      );
    }
  }

  agregarAlCarrito(producto: Producto) {
    const itemExistente = this.carrito.find(item => item.producto_id === producto.producto_id);
    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio_unitario;
    } else {
      this.carrito.push({
        producto_id: producto.producto_id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_venta, 
        cantidad: 1,
        subtotal: Number(producto.precio_venta)
      });
    }
    this.calcularTotal();
  }

  cambiarCantidad(index: number, delta: number) {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad > 0) {
      item.cantidad = nuevaCantidad;
      item.subtotal = item.cantidad * item.precio_unitario;
    } else {
      this.eliminarDelCarrito(index);
    }
    this.calcularTotal();
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalVenta = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

 guardarVenta() {
    if (this.carrito.length === 0) return;

    // 1. VALIDAMOS SOLO EL USUARIO (Este sí es obligatorio)
    if (!this.usuarioIdActual) {
      alert('❌ Error: No se identifica al usuario. Vuelve a iniciar sesión.');
      return;
    }
    
    // YA NO validamos si tiene sucursal. Si es null, pasará como null.

    const ventaDTO = {
      // Si this.sucursalIdActual es null, se enviará null al backend
      sucursal_id: this.sucursalIdActual, 
      usuario_id: this.usuarioIdActual,   
      total: this.totalVenta,
      detalles: this.carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    console.log('Enviando venta (puede llevar sucursal null):', ventaDTO);

    this.ventasService.registrarVenta(ventaDTO).subscribe({
      next: (res: any) => {
        alert(`✅ Venta registrada con éxito. Ticket #${res.ventaId}`);
        this.carrito = [];
        this.calcularTotal();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al registrar. Si eres Gerente Global, asegúrate de que la base de datos permita sucursal_id NULL.');
      }
    });
  }
}