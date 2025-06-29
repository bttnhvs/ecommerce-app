import { signalStore, withComputed } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ProductsStore } from './products.store';
import { CartStore } from './cart.store';
import { Product } from '../models/product';
import { CartItem } from './cart.store';

export interface RootState {
  products: {
    products: Product[];
    loading: boolean;
    error: string | null;
  };
  cart: {
    items: CartItem[];
    totalQuantity: number;
    totalPrice: number;
  };
}

export const RootStore = signalStore(
  { providedIn: 'root' },
  withComputed(() => {
    const productsStore = inject(ProductsStore);
    const cartStore = inject(CartStore);
    
    return {
      // Computed root state
      state: computed(() => ({
        products: {
          products: productsStore.products(),
          loading: productsStore.loading(),
          error: productsStore.error()
        },
        cart: {
          items: cartStore.items(),
          totalQuantity: cartStore.totalQuantity(),
          totalPrice: cartStore.totalPrice()
        }
      })),

      // Global selectors
      isLoading: computed(() => productsStore.loading()),
      hasError: computed(() => productsStore.error() !== null),
      errorMessage: computed(() => productsStore.error()),
      cartItemCount: computed(() => cartStore.totalQuantity()),
      cartTotalPrice: computed(() => cartStore.totalPrice()),
      
      // Additional computed properties
      isCartEmpty: computed(() => cartStore.isEmpty()),
      productCount: computed(() => productsStore.productCount()),
      hasProducts: computed(() => productsStore.hasProducts()),
      availableProducts: computed(() => productsStore.availableProducts()),
      outOfStockProducts: computed(() => productsStore.outOfStockProducts())
    };
  })
); 