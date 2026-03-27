// Imports
import { Component, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { Product } from '@app/product/product';
import { Vendor } from '@app/vendor/vendor';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.scss'],
})
export class ProductDetails implements OnInit {
  // Inputs
  product = input<Product | null>(null);
  vendors = input<Vendor[]>([]);
  existingIds = input<string[]>([]);

  // Outputs
  save = output<Product>();
  delete = output<string>();
  cancel = output<void>();

  // Form
  productForm = new FormGroup({
    id: new FormControl('', Validators.compose([
      Validators.required,
      (control: AbstractControl): { invalidId: boolean } | null => {
        // Skip duplicate check if editing an existing product
        if (this.product()?.id) return null;
        const exists = this.existingIds().includes(control.value);
        return exists ? { invalidId: true } : null;
      },
    ])),

    vendorId: new FormControl(0, Validators.compose([
      Validators.required,
      Validators.min(1),
    ])),

    name: new FormControl('', Validators.required),
    cost: new FormControl(0, Validators.compose([Validators.required, Validators.min(1)])),
    msrp: new FormControl(0, Validators.compose([Validators.required, Validators.min(1)])),
    rop: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
    eoq: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
    qoh: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
    qoo: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
  });

  ngOnInit(): void {
    // Initialize form values when product changes
    const prod = this.product();
    if (prod) {
      this.productForm.patchValue({
        id: prod.id,
        vendorId: prod.vendorId,
        name: prod.name,
        cost: prod.cost,
        msrp: prod.msrp,
        rop: prod.rop,
        eoq: prod.eoq,
        qoh: prod.qoh,
        qoo: prod.qoo,
      });
    }
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.save.emit(this.productForm.value as Product);
    }
  }

  onDelete(): void {
    const prod = this.product();
    if (prod?.id) {
      this.delete.emit(prod.id);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get vendorName(): string {
    const vendor = this.vendors().find(v => v.id === this.productForm.value.vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  }
}
