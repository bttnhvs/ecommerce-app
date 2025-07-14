import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProductsStore } from './products.store';
import { Product } from '../models/product';
import { v4 as uuidv4 } from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class ProductsEffects {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly productsStore = inject(ProductsStore);
  private apiUrl = 'https://63c10327716562671870f959.mockapi.io/products';

  loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => {
        const productsWithIds = products.map(product => ({
          ...product,
          id: uuidv4()
        }));

        this.productsStore.setProducts(productsWithIds);
      })
    );
  }
}
