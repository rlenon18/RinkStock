import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatLabel, MatFormField } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { Vendor } from '@app/vendor/vendor';
import { VendorService } from '@app/vendor/vendor.service';

import { Product } from '@app/product/product';
import { ProductService } from '@app/product/product.service';

import { PurchaseOrder } from '../purchase-order';
import { PurchaseOrderService } from '../purchase-order.service';

@Component({
  selector: 'app-purchase-order-generator',
  imports: [
    ReactiveFormsModule, FormsModule,
    MatCardModule, MatInputModule, MatButtonModule,
    MatLabel, MatFormField, MatSelectModule, MatOptionModule, MatTableModule, CommonModule
  ],
  templateUrl: './purchase-order-generator.html',
  styleUrl: './purchase-order-generator.scss'
})
export class PurchaseOrderGenerator implements OnInit {
  constructor(
    protected vendorService: VendorService,
    protected productService: ProductService,
    protected purchaseOrderService: PurchaseOrderService
  ) {}

  vendors = signal<Vendor[]>([]);
  vendorPurchaseOrder = signal<Product[]>([]);
  purchaseOrderCreatedMessage = signal<String>('');
  poCreatedId = signal<number>(0);

  tableColumns = ['productId', 'quantity', 'cost'];
  purchaseOrderTable = new MatTableDataSource<any>(); // type any so we can add quantity

  purchaseOrderForm: FormGroup = new FormGroup({
    vendorId: new FormControl(),
    productId: new FormControl(),
  });

  selectedQuantity: number = 1; // The number shown in the table

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors() {
    this.vendorService.getAll().subscribe({
      next: (payload: Vendor[]) => this.vendors.set(payload),
      error: e => console.error(e)
    });
  }

  onVendorSelectionChange(selection: MatSelectChange) {
    this.productService.getAllById(selection.value).subscribe({
      next: (payload: Product[]) => this.vendorPurchaseOrder.set(payload),
      error: e => console.error(e)
    });
  }

  selectedVendorId() {
    return (this.purchaseOrderForm.get('vendorId')?.value ?? 0) as number;
  }

  selectedProductId() {
    return (this.purchaseOrderForm.get('productId')?.value ?? 0);
  }

  productAlreadyAdded() {
    const selectedId = this.selectedProductId();
    if (selectedId === 0) return false;
    return this.purchaseOrderTable.data.some(p => p.id === selectedId);
  }

  purchaseOrderSubTotal() {
    return this.purchaseOrderTable.data.reduce(
      (sum, product) => sum + product.cost * product.quantity,
      0
    );
  }

  purchaseOrderTax() {
    return this.purchaseOrderSubTotal() * 0.13;
  }

  purchaseOrderTotalWithTax() {
    return this.purchaseOrderSubTotal() + this.purchaseOrderTax();
  }

  addProduct() {
    const selectedId = this.selectedProductId();
    if (!this.productAlreadyAdded()) {
      const product = this.vendorPurchaseOrder().find(p => p.id === selectedId);
      if (product) {
        // snapshot the selected quantity
        const productWithQty = { ...product, quantity: this.selectedQuantity };
        this.purchaseOrderTable.data.push(productWithQty);
        this.purchaseOrderTable.data = [...this.purchaseOrderTable.data]; // trigger refresh
        this.selectedQuantity = 1; // optional: reset input
      }
    }
  }

  removePurchaseOrder() {
    const selectedId = this.selectedProductId();
    this.purchaseOrderTable.data = this.purchaseOrderTable.data.filter(p => p.id !== selectedId);
  }

  savePurchaseOrder() {
    const po: PurchaseOrder = {
      id: 0,
      vendorId: this.selectedVendorId(),
      items: [],
      date: ''
    };

    this.purchaseOrderTable.data.forEach(product => {
      po.items.push({
        id: 0,
        poId: 0,
        productId: product.id.toString(),
        quantity: product.quantity // now correctly reflects the per-item quantity
      });
    });

    this.purchaseOrderService.create(po).subscribe({
      next: (payload: PurchaseOrder) => {
        // Reset form & table
        this.purchaseOrderForm.get('vendorId')?.setValue(0);
        this.purchaseOrderForm.get('productId')?.setValue(0);
        this.purchaseOrderTable.data = [];
        this.vendorPurchaseOrder.set([]);
        this.poCreatedId.set(payload.id);

        this.purchaseOrderCreatedMessage.set(
          `Purchase Order #${payload.id} created at ${payload.date}`
        );
      },
      error: e => console.error(e)
    });
  }

  viewPDF() {
    window.open(`${this.purchaseOrderService.apiURL()}/po/pdf/${this.poCreatedId()}`);
  }
}
