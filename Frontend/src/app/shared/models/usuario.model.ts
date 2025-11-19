export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: 'admin' | 'operaciones' | 'gerente';
  sucursalId: number | null;
}