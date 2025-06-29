import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Product } from '../models/product';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState<ProductsState>({
    products: [],
    loading: false,
    error: null
  }),
  withComputed((state) => ({
    // Computed properties for better performance
    productCount: computed(() => state.products().length),
    hasProducts: computed(() => state.products().length > 0),
    hasError: computed(() => state.error() !== null),
    isLoading: computed(() => state.loading()),
    
    // Computed selectors
    availableProducts: computed(() => 
      state.products().filter(product => product.availableAmount > 0)
    ),
    outOfStockProducts: computed(() => 
      state.products().filter(product => product.availableAmount === 0)
    )
  })),
  withMethods((state) => ({
    setProducts(products: Product[]): void {
      patchState(state, { products });
    },
    
    setLoading(loading: boolean): void {
      patchState(state, { loading });
    },
    
    setError(error: string | null): void {
      patchState(state, { error });
    },
    
    getProductById(id: string): Product | undefined {
      return state.products().find((product: Product) => product.id === id);
    },
    
    getProductsByCategory(category: string): Product[] {
      return state.products().filter((product: Product) => 
        product.name.toLowerCase().includes(category.toLowerCase())
      );
    },
    
    updateProductAvailability(productId: string, quantityChange: number): void {
      const currentProducts = state.products();
      const productIndex = currentProducts.findIndex((product: Product) => product.id === productId);
      
      if (productIndex !== -1) {
        const updatedProducts = [...currentProducts];
        const product = updatedProducts[productIndex];
        
        // Ensure we don't go below 0 or above the original available amount
        const newAvailableAmount = Math.max(0, Math.min(
          product.availableAmount - quantityChange,
          product.availableAmount
        ));
        
        updatedProducts[productIndex] = {
          ...product,
          availableAmount: newAvailableAmount
        };
        
        patchState(state, { products: updatedProducts });
      }
    }
  }))
); 