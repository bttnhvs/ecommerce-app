import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product';
import { ProductsStore } from '../store/products.store';
import { CartStore } from '../store/cart.store';
import { ProductsEffects } from '../store/products.effects';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsStore = inject(ProductsStore);
  private readonly cartStore = inject(CartStore);
  private readonly productsEffects = inject(ProductsEffects);

  readonly products = this.productsStore.products;
  readonly cartItems = this.cartStore.items;
  readonly cartTotalQuantity = this.cartStore.totalQuantity;
  readonly cartTotalPrice = this.cartStore.totalPrice;

  fetchProducts() {
    return this.productsEffects.loadProducts();
  }

  addToCart(product: Product, amount: number): boolean {
    return this.cartStore.addToCart(product, amount);
  }

  getCartItems() {
    return this.cartStore.items();
  }

  updateCartItemQuantity(productId: string, newQuantity: number) {
    return this.cartStore.updateQuantity(productId, newQuantity);
  }

  removeFromCart(productId: string) {
    this.cartStore.removeFromCart(productId);
  }

  clearCart() {
    this.cartStore.clearCart();
  }

  getProductById(id: string): Product | undefined {
    return this.productsStore.getProductById(id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.productsStore.getProductsByCategory(category);
  }
}
