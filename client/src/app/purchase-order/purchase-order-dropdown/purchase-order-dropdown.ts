import { Component, OnChanges, signal, input, output, SimpleChanges } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatLabel } from '@angular/material/form-field';

import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { PurchaseOrder } from '../purchase-order';
import { PurchaseOrderService } from '../purchase-order.service';
@Component({
  selector: 'app-purchase-order-dropdown',
  imports: [MatCardModule, ReactiveFormsModule, MatLabel, MatSelectModule, MatOptionModule],
  templateUrl: './purchase-order-dropdown.html',
  styleUrl: './purchase-order-dropdown.scss'
})
export class PurchaseOrderDropdown implements OnChanges {

  constructor(protected purchaseOrderService: PurchaseOrderService) {}

  vendorId = input<number>(0);
  purchaseorders = signal<PurchaseOrder[]>([]);
  selected = output<PurchaseOrder>();

  formGroup = new FormGroup({
    purchaseorder: new FormControl()
  });

  ngOnChanges(): void {
    this.formGroup.reset();
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders() {
    this.purchaseOrderService.getAllById(this.vendorId()).subscribe({
      next: (payload: PurchaseOrder[]) => this.purchaseorders.set(payload),
      error: e => console.log(e)
    });
  }

  purchaseorderSelected(selection: MatSelectChange) {
    this.selected.emit(selection.value);
  }
}
