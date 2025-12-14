export interface Producto {
  codigo: string;
  nombre: string;
  insumoPrincipal: string;
  stockActual: number;
  unidad: string;
  ultimaActualizacion: Date;
  sucursalId: number | null;
}
