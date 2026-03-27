import { Injectable } from '@angular/core';
import { Product } from '@app/product/product'

import { HttpApiService } from '@app/http-api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends HttpApiService <Product> {
     constructor(http: HttpClient) {
    super(http, 'products');
  }
}
