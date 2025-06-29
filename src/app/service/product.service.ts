import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '../models/product';

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  products: Product[];
  cart: Map<string, CartItem>;
}

const INITIAL_STATE: AppState = {
  products: [],
  cart: new Map()
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://63c10327716562671870f959.mockapi.io/products';

  // Private BehaviorSubject for internal state management
  private readonly _state = new BehaviorSubject<AppState>(INITIAL_STATE);

  // Public observables for components to subscribe to
  readonly products$ = this._state.pipe(
    map(state => state.products)
  );

  readonly cart$ = this._state.pipe(
    map(state => state.cart)
  );

  readonly cartItems$ = this._state.pipe(
    map(state => {
      const cartValues = Array.from(state.cart.values());
      return cartValues.filter(item => item && item.product && item.quantity > 0);
    })
  );

  // Get current state values (for synchronous access when needed)
  get products(): Product[] {
    return this._state.value.products;
  }

  get cart(): Map<string, CartItem> {
    return this._state.value.cart;
  }

  get cartItems(): CartItem[] {
    const cartValues = Array.from(this.cart.values());
    return cartValues.filter(item => item && item.product && item.quantity > 0);
  }

  fetchProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe((products) => {
      this.updateState({ products });
    });
  }

  addToCart(product: Product, amount: number): boolean {
    if (amount < product.minOrderAmount || amount > product.availableAmount) {
      return false;
    }

    const currentState = this._state.value;
    const cart = new Map(currentState.cart);
    const existing = cart.get(product.id);

    if (existing) {
      if (existing.quantity + amount > product.availableAmount) return false;
      existing.quantity += amount;
    } else {
      cart.set(product.id, { product, quantity: amount });
    }

    // Update product available amount
    const updatedProducts = currentState.products.map(p => 
      p.id === product.id 
        ? { ...p, availableAmount: p.availableAmount - amount }
        : p
    );

    this.updateState({ 
      products: updatedProducts,
      cart 
    });
    
    return true;
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  updateCartItemQuantity(productId: string, newQuantity: number) {
    const currentState = this._state.value;
    const cart = new Map(currentState.cart);
    const existing = cart.get(productId);
    
    if (existing) {
      const oldQuantity = existing.quantity;
      const quantityDiff = newQuantity - oldQuantity;
      
      // Check if new quantity is valid
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      
      if (existing.product.availableAmount - quantityDiff < 0) {
        return; // Not enough available
      }

      existing.quantity = newQuantity;
      
      // Update product available amount
      const updatedProducts = currentState.products.map(p => 
        p.id === productId 
          ? { ...p, availableAmount: p.availableAmount - quantityDiff }
          : p
      );

      this.updateState({ 
        products: updatedProducts,
        cart 
      });
    }
  }

  removeFromCart(productId: string) {
    const currentState = this._state.value;
    const cart = new Map(currentState.cart);
    const existing = cart.get(productId);
    
    if (existing) {
      // Restore the available amount when removing from cart
      const updatedProducts = currentState.products.map(p => 
        p.id === productId 
          ? { ...p, availableAmount: p.availableAmount + existing.quantity }
          : p
      );
      
      cart.delete(productId);
      
      this.updateState({ 
        products: updatedProducts,
        cart 
      });
    }
  }

  clearCart() {
    const currentState = this._state.value;
    const cart = new Map(currentState.cart);
    
    // Restore all available amounts when clearing cart
    const updatedProducts = currentState.products.map(product => {
      const cartItem = cart.get(product.id);
      if (cartItem) {
        return { ...product, availableAmount: product.availableAmount + cartItem.quantity };
      }
      return product;
    });
    
    this.updateState({ 
      products: updatedProducts,
      cart: new Map()
    });
  }

  // Private method to update state
  private updateState(partialState: Partial<AppState>) {
    const currentState = this._state.value;
    const newState = { ...currentState, ...partialState };
    this._state.next(newState);
  }

  // Method to subscribe to state changes (alternative to using observables directly)
  subscribe(callback: (state: AppState) => void) {
    return this._state.subscribe(callback);
  }
} 