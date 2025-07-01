import { signalStore, withComputed } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ProductsStore } from './products.store';
import { CartStore } from './cart.store';

export const RootStore = signalStore(
  { providedIn: 'root' },
  withComputed(() => {
    const productsStore = inject(ProductsStore);
    const cartStore = inject(CartStore);
    
    return {
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
      isLoading: computed(() => productsStore.loading()),
      hasError: computed(() => productsStore.error() !== null),
      errorMessage: computed(() => productsStore.error()),
      cartItemCount: computed(() => cartStore.totalQuantity()),
      cartTotalPrice: computed(() => cartStore.totalPrice()),
      isCartEmpty: computed(() => cartStore.isEmpty()),
      outOfStockProducts: computed(() => productsStore.outOfStockProducts())
    };
  })
); 