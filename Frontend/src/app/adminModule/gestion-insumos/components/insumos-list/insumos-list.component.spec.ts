import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsumosListComponent } from './insumos-list.component';

describe('InsumosListComponent', () => {
  let component: InsumosListComponent;
  let fixture: ComponentFixture<InsumosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsumosListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsumosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
