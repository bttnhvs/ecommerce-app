import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://63c10327716562671870f959.mockapi.io/products';

  private readonly _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();

  private readonly _cart = signal<Map<string, { product: Product; quantity: number }>>(new Map());
  readonly cart = this._cart.asReadonly();

  readonly cartItems = computed(() => Array.from(this._cart().values()));

  fetchProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((products) => {
      this._products.set(products);
    });
  }

  addToCart(product: Product, amount: number): boolean {
    if (amount < product.minOrderAmount || amount > product.availableAmount) {
      return false;
    }
    const cart = new Map(this._cart());
    const existing = cart.get(product.id);
    if (existing) {
      if (existing.quantity + amount > product.availableAmount) return false;
      existing.quantity += amount;
    } else {
      cart.set(product.id, { product, quantity: amount });
    }
    product.availableAmount -= amount;
    this._cart.set(cart);
    return true;
  }

  getCartItems() {
    return Array.from(this._cart().values());
  }
} 