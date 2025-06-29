import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, lastValueFrom } from 'rxjs';
import { ProductsStore } from './products.store';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsEffects {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly productsStore = inject(ProductsStore);
  private apiUrl = 'https://63c10327716562671870f959.mockapi.io/products';

  loadProducts(): Observable<Product[]> {
    this.productsStore.setLoading(true);
    this.productsStore.setError(null);
    
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => {
        this.productsStore.setProducts(products);
      }),
      catchError(error => {
        this.productsStore.setError('Failed to fetch products');
        throw error;
      }),
      finalize(() => {
        this.productsStore.setLoading(false);
      })
    );
  }

  // Alternative async method for components that prefer promises
  async loadProductsAsync(): Promise<Product[]> {
    try {
      this.productsStore.setLoading(true);
      this.productsStore.setError(null);
      
      const products = await lastValueFrom(this.http.get<Product[]>(this.apiUrl));
      this.productsStore.setProducts(products);
      return products;
    } catch (error) {
      this.productsStore.setError('Failed to fetch products');
      throw error;
    } finally {
      this.productsStore.setLoading(false);
    }
  }
} 