import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insumos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insumos-list.component.html',
  styleUrls: ['./insumos-list.component.css']
})
export class InsumosListComponent {
  @Input() insumos: any[] = [];
  @Input() isLoading = true;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<number>();

  edit(item: any) {
    this.onEdit.emit(item);
  }

  delete(id: number) {
    this.onDelete.emit(id);
  }
}