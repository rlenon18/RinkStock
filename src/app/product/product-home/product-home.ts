import { Component, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';

import { Product } from '@app/product/product';
import { ProductService } from '@app/product/product.service';
import { Vendor } from '@app/vendor/vendor';
import { VendorService } from '@app/vendor/vendor.service';
import { ProductDetails } from '@app/product/product-details/product-details';
import { PRODUCT_DEFAULT } from '@app/constants';

@Component({
  selector: 'app-product-home',
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatExpansionModule, MatButtonModule, ProductDetails, MatSortModule],
  templateUrl: './product-home.html',
  styleUrl: './product-home.scss'
})
export class ProductHome implements OnInit, AfterViewInit {
  productsTable = new MatTableDataSource<Product>();
  vendors = signal<Vendor[]>([]);
  selectedProduct = signal<Product | null>(null);

  @ViewChild(MatSort) sort!: MatSort;

  tableColumns: string[] = ['id', 'name', 'vendorName'];

  constructor(public productService: ProductService, public vendorService: VendorService) {}

  productIds(): string[] {
    return this.productsTable.data.map(product => product.id);
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadVendors();
  }

  ngAfterViewInit() {
    this.productsTable.sort = this.sort;
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (payload: Product[]) => (this.productsTable.data = payload),
      error: (e) => console.error(e)
    });
  }

  loadVendors() {
    this.vendorService.getAll().subscribe({
      next: (payload: Vendor[]) => this.vendors.set(payload),
      error: (e) => console.error(e)
    });
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
  }

  backToTable() {
    this.selectedProduct.set(null);
  }

  vendorOfId(vendorId: number): string {
    return this.vendors().find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  }

  // --- CRUD Handlers ---
  onSaveProduct(product: Product) {
    if (this.productsTable.data.find(p => p.id === product.id)) {
      // Update
      this.productService.update(product).subscribe({
        next: () => this.loadProducts(),
        error: e => console.error(e),
        complete: () => this.backToTable()
      });
    } else {
      // Create
      this.productService.create(product).subscribe({
        next: () => this.loadProducts(),
        error: e => console.error(e),
        complete: () => this.backToTable()
      });
    }
  }

  onDeleteProduct(id: string) {
    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: e => console.error(e),
      complete: () => this.backToTable()
    });
  }

  onCancelEdit() {
    this.backToTable();
  }

  addNewProduct() {
    this.selectedProduct.set(PRODUCT_DEFAULT);
  }

  // --- Sorting ---
  sortProducts(sort: Sort) {
    const columnToSortingFunction = {
      id: (a: Product, b: Product) => {
        return sort.direction === 'asc'
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      },
      name: (a: Product, b: Product) => {
        return sort.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      },
      vendorName: (a: Product, b: Product) => {
        const aName = this.vendorOfId(a.vendorId);
        const bName = this.vendorOfId(b.vendorId);
        return sort.direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
    };

    const sortingKey = sort.active as keyof typeof columnToSortingFunction;
    const howToSort = columnToSortingFunction[sortingKey];

    this.productsTable.data = this.productsTable.data.sort(howToSort);
  }
}
