import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.css']
})
export class ProductosListComponent {

  @Input() productos: any[] = [];
  @Input() isLoading = false;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<number>();

  edit(item: any) {
    this.onEdit.emit(item);
  }

  delete(id: number) {
    this.onDelete.emit(id);
  }
}
