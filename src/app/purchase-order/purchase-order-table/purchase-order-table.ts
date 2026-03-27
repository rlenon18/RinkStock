import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';

import { Product } from '@app/product/product';
@Component({
  selector: 'app-purchase-order-table',
  imports: [MatCardModule, MatTableModule, CurrencyPipe],
  templateUrl: './purchase-order-table.html',
  styleUrl: './purchase-order-table.scss'
})
export class PurchaseOrderTable implements OnChanges {

  tableColumns = ['productId', 'quantity', 'cost'];
  poTable = new MatTableDataSource<Product>();
  products = input<Product[]>([]);

  ngOnChanges(): void {
      this.poTable.data = this.products();
  }

  poSubTotal(): number {
    return this.poTable.data.reduce((sum, product) => sum + product.cost, 0);
  }

  poTax():number {
    return this.poSubTotal() * 0.13;
  }

  pograndTotal(): number {
    return this.poSubTotal() + this.poTax();
  }


}
