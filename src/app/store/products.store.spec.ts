import { TestBed } from '@angular/core/testing';
import { ProductsStore } from './products.store';
import { Product } from '../models/product';

describe('ProductsStore', () => {
  let productsStore: any;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product 1',
      img: 'test1.jpg',
      availableAmount: 10,
      minOrderAmount: 1,
      price: 100
    },
    {
      id: '2',
      name: 'Test Product 2',
      img: 'test2.jpg',
      availableAmount: 5,
      minOrderAmount: 2,
      price: 200
    },
    {
      id: '3',
      name: 'Test Product 3',
      img: 'test3.jpg',
      availableAmount: 0,
      minOrderAmount: 1,
      price: 150
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsStore]
    });
    productsStore = TestBed.inject(ProductsStore);
  });

  it('should be created', () => {
    expect(productsStore).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty products array', () => {
      expect(productsStore.products()).toEqual([]);
    });

    it('should have loading set to false', () => {
      expect(productsStore.loading()).toBe(false);
    });

    it('should have error set to null', () => {
      expect(productsStore.error()).toBe(null);
    });
  });

  describe('setProducts', () => {
    it('should set products array', () => {
      productsStore.setProducts(mockProducts);

      expect(productsStore.products()).toEqual(mockProducts);
    });

  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      productsStore.setLoading(true);
      expect(productsStore.loading()).toBe(true);

      productsStore.setLoading(false);
      expect(productsStore.loading()).toBe(false);
    });

  });

  describe('setError', () => {
    it('should set error state', () => {
      productsStore.setError('Test error');
      expect(productsStore.error()).toBe('Test error');

      productsStore.setError(null);
      expect(productsStore.error()).toBe(null);
    });

  });

  describe('getProductById', () => {
    beforeEach(() => {
      productsStore.setProducts(mockProducts);
    });

    it('should return product by id', () => {
      const product = productsStore.getProductById('1');
      expect(product).toEqual(mockProducts[0]);
    });

    it('should return undefined for non-existent product', () => {
      const product = productsStore.getProductById('999');
      expect(product).toBeUndefined();
    });

    it('should return undefined for empty products array', () => {
      productsStore.setProducts([]);
      const product = productsStore.getProductById('1');
      expect(product).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    beforeEach(() => {
      productsStore.setProducts(mockProducts);
    });

    it('should return products matching category name', () => {
      const products = productsStore.getProductsByCategory('Product 1');
      expect(products.length).toBe(1);
      expect(products[0]).toEqual(mockProducts[0]);
    });

    it('should be case insensitive', () => {
      const products = productsStore.getProductsByCategory('product 1');
      expect(products.length).toBe(1);
      expect(products[0]).toEqual(mockProducts[0]);
    });

    it('should return empty array for non-matching category', () => {
      const products = productsStore.getProductsByCategory('NonExistent');
      expect(products.length).toBe(0);
    });

    it('should return all products for empty search term', () => {
      const products = productsStore.getProductsByCategory('');
      expect(products.length).toBe(3);
    });

    it('should return all products when search term matches all', () => {
      const products = productsStore.getProductsByCategory('Test');
      expect(products.length).toBe(3);
    });
  });

  describe('updateProductAvailability', () => {
    beforeEach(() => {
      productsStore.setProducts(mockProducts);
    });

    it('should update product availability', () => {
      productsStore.updateProductAvailability('1', 3);

      const updatedProduct = productsStore.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(7);
    });

    it('should not go below zero availability', () => {
      productsStore.updateProductAvailability('1', 15);

      const updatedProduct = productsStore.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(0);
    });

    it('should not exceed original available amount', () => {
      productsStore.updateProductAvailability('1', -5);

      const updatedProduct = productsStore.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(10);
    });

    it('should do nothing for non-existent product', () => {
      const originalProducts = productsStore.products();
      
      productsStore.updateProductAvailability('999', 3);

      expect(productsStore.products()).toEqual(originalProducts);
    });
  });

  describe('computed properties', () => {

    it('should filter out of stock products correctly', () => {
      productsStore.setProducts(mockProducts);

      const outOfStockProducts = productsStore.outOfStockProducts();
      expect(outOfStockProducts.length).toBe(1);
      expect(outOfStockProducts[0].availableAmount).toBe(0);
    });

  });

  describe('state management', () => {
    it('should maintain state consistency across operations', () => {
      // Set initial state
      productsStore.setProducts(mockProducts);
      productsStore.setLoading(false);
      productsStore.setError(null);

      expect(productsStore.products()).toEqual(mockProducts);
      expect(productsStore.loading()).toBe(false);
      expect(productsStore.error()).toBe(null);

      // Update availability
      productsStore.updateProductAvailability('1', 3);
      const updatedProduct = productsStore.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(7);

      // Verify other products unchanged
      const unchangedProduct = productsStore.getProductById('2');
      expect(unchangedProduct?.availableAmount).toBe(5);
    });
  });
}); 