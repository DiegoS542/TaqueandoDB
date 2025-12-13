export interface InsumoProveedorDetalle {
  proveedor_id: number;
  nombre_empresa: string;
  precio_compra: number;
}

export interface Insumo {
  insumo_id?: number;
  nombre: string;
  unidad_medida: 'Kg' | 'Pz' | 'L' | 'Pq'; 
  proveedores?: InsumoProveedorDetalle[]; // Puede venir vacío
}