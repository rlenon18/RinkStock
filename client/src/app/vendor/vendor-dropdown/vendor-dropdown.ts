import { Component, OnInit, signal, output } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatLabel, MatFormField } from '@angular/material/form-field';

import { Vendor } from '../vendor';
import { VendorService } from '../vendor.service';
@Component({
  selector: 'app-vendor-dropdown',
  imports: [MatCardModule, MatLabel, MatFormField, MatSelectModule, MatOptionModule],
  templateUrl: './vendor-dropdown.html',
  styleUrl: './vendor-dropdown.scss'
})
export class VendorDropdown implements OnInit {

  constructor(protected vendorService: VendorService) {}

  vendors = signal<Vendor[]>([]);
  selected = output<Vendor>();

  ngOnInit(): void {
      this.loadVendors();
  }

  loadVendors() {
    this.vendorService.getAll().subscribe({
      next: (payload: Vendor[]) => this.vendors.set(payload),
      error: e=> console.log(e)
    });
  }

  onVendorSelectionChange(selection: MatSelectChange) {
    this.selected.emit(selection.value);
  }
}
