import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Product } from '../models/product';

export interface ProductsState {
  products: Product[];
  originalAmounts: { [productId: string]: number };
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState<ProductsState>({
    products: [],
    originalAmounts: {}
  }),
  withMethods((state) => ({
    setProducts(products: Product[]): void {
      const originalAmounts: { [productId: string]: number } = {};
      products.forEach(product => {
        originalAmounts[product.id] = product.availableAmount;
      });
      patchState(state, { products, originalAmounts });

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
        const originalAmount = state.originalAmounts()[productId] ?? product.availableAmount;
        const newAvailableAmount = product.availableAmount - quantityChange;
        const clampedAmount = Math.max(0, Math.min(newAvailableAmount, originalAmount));
        updatedProducts[productIndex] = {
          ...product,
          availableAmount: clampedAmount
        };
        patchState(state, { products: updatedProducts });
      }
    }
  }))
);
