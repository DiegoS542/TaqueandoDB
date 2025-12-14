export interface Proveedor {
    proveedor_id?: number;
    nombre_empresa: string;
    contacto: string;
    total_insumos_surtidos?: number;
    precio_minimo?: number;
    precio_maximo?: number;
}