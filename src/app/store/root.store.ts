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
        },
        cart: {
          items: cartStore.items(),
          totalQuantity: cartStore.totalQuantity(),
          totalPrice: cartStore.totalPrice()
        }
      })),
      cartItemCount: computed(() => cartStore.totalQuantity()),
    };
  })
);
