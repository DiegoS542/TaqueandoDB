import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-usuarios-list',
  imports: [CommonModule],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent {
  @Input() usuarios: any[] = [];
  @Input() isLoading: boolean = true; // Recibe el estado de carga
  
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<number>();

  edit(usuario: any) {
    this.onEdit.emit(usuario);
  }

  delete(id: number) {
    this.onDelete.emit(id);
  }
}
