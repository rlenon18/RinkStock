import { Component, OnInit, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatLabel, MatFormField } from '@angular/material/form-field';

import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { Vendor } from '@app/vendor/vendor';
import { VendorService } from '@app/vendor/vendor.service';
import { VendorDropdown } from '@app/vendor/vendor-dropdown/vendor-dropdown';

import { PurchaseOrder } from '../purchase-order';
import { PurchaseOrderLineItem } from '../purchase-order-line-item';
import { PurchaseOrderDropdown } from '../purchase-order-dropdown/purchase-order-dropdown';


import { Product } from '@app/product/product';
import { ProductService } from '@app/product/product.service';

import { PurchaseOrderTable } from '../purchase-order-table/purchase-order-table'

import { PO_DEFAULT } from '@app/constants';


@Component({
  selector: 'app-purchase-order-viewer',
  imports: [MatCardModule, VendorDropdown, PurchaseOrderDropdown, PurchaseOrderTable, MatButtonModule],
  templateUrl: './purchase-order-viewer.html',
  styleUrl: './purchase-order-viewer.scss'
})
export class PurchaseOrderViewer {

  constructor(protected productService: ProductService) {
  }

  vendorId = signal<number>(0);
  purchaseorder = signal<PurchaseOrder>(PO_DEFAULT);

  vendorProducts = signal<Product[]>([]);
  productsForPo = signal<Product[]>([]);

    vendorSelected(vendor: Vendor) {
    this.vendorId.set(vendor.id);
    this.purchaseorder.set(PO_DEFAULT);
    this.productsForPo.set([]);

    this.productService.getAllById(this.vendorId()).subscribe({
      next: (payload: Product[]) => this.vendorProducts.set(payload),
      error: e => console.log(e),
    });
    }

    poSelected(purchaseorder: PurchaseOrder) {
      console.log(purchaseorder);
      this.purchaseorder.set(purchaseorder);

      let productIds = purchaseorder.items.map((purchaseOrderItem: PurchaseOrderLineItem) => purchaseOrderItem.productId);

      this.productsForPo.set([]);
      productIds.forEach((productId: string) => {
        let product = this.vendorProducts().find(p => p.id == productId);
        if (product) {
          this.productsForPo().push(product)
        }
      })
    }
   viewPDF() {
    window.open(`${this.productService.apiURL()}/po/pdf/${this.purchaseorder().id}`);
  }
}
