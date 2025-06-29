import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Product } from '../models/product';
import { ProductsStore } from './products.store';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState<CartState>({
    items: []
  }),
  withComputed((state) => {
    const productsStore = inject(ProductsStore);
    
    return {
      // Computed cart totals
      totalQuantity: computed(() => 
        state.items().reduce((total, item) => total + item.quantity, 0)
      ),
      totalPrice: computed(() => 
        state.items().reduce((total, item) => total + (item.quantity * item.product.price), 0)
      ),
      
      // Helper computed properties
      isEmpty: computed(() => state.items().length === 0),
      itemCount: computed(() => state.items().length)
    };
  }),
  withMethods((state) => {
    const productsStore = inject(ProductsStore);
    
    return {
      addToCart(product: Product, quantity: number): boolean {
        if (quantity < product.minOrderAmount || quantity > product.availableAmount) {
          return false;
        }
        
        const currentItems = state.items();
        const existingItemIndex = currentItems.findIndex((item: CartItem) => item.product.id === product.id);
        
        let updatedItems: CartItem[];
        if (existingItemIndex >= 0) {
          const existingItem = currentItems[existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;
          
          if (newQuantity > product.availableAmount) {
            return false;
          }
          
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity
          };
        } else {
          updatedItems = [...currentItems, { product, quantity }];
        }
        
        // Update product availability
        productsStore.updateProductAvailability(product.id, quantity);
        
        patchState(state, { items: updatedItems });
        return true;
      },
      
      removeFromCart(productId: string): void {
        const currentItems = state.items();
        const itemToRemove = currentItems.find((item: CartItem) => item.product.id === productId);
        const updatedItems = currentItems.filter((item: CartItem) => item.product.id !== productId);
        
        // Restore product availability if item was found
        if (itemToRemove) {
          productsStore.updateProductAvailability(productId, -itemToRemove.quantity);
        }
        
        patchState(state, { items: updatedItems });
      },
      
      updateQuantity(productId: string, quantity: number): boolean {
        const currentItems = state.items();
        const itemIndex = currentItems.findIndex((item: CartItem) => item.product.id === productId);
        
        if (itemIndex === -1) {
          return false;
        }
        
        const item = currentItems[itemIndex];
        const oldQuantity = item.quantity;
        
        if (quantity < item.product.minOrderAmount || quantity > item.product.availableAmount + oldQuantity) {
          return false;
        }
        
        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = {
          ...item,
          quantity
        };
        
        // Update product availability (difference between old and new quantity)
        const quantityDifference = oldQuantity - quantity;
        productsStore.updateProductAvailability(productId, quantityDifference);
        
        patchState(state, { items: updatedItems });
        return true;
      },
      
      clearCart(): void {
        const currentItems = state.items();
        
        // Restore all product availability
        currentItems.forEach((item: CartItem) => {
          productsStore.updateProductAvailability(item.product.id, -item.quantity);
        });
        
        patchState(state, { items: [] });
      },
      
      getItemQuantity(productId: string): number {
        const item = state.items().find((item: CartItem) => item.product.id === productId);
        return item ? item.quantity : 0;
      },
      
      isInCart(productId: string): boolean {
        return state.items().some((item: CartItem) => item.product.id === productId);
      },
      
      getCartItem(productId: string): CartItem | undefined {
        return state.items().find((item: CartItem) => item.product.id === productId);
      }
    };
  })
); 