import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;

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
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient()
      ]
    });
    service = TestBed.inject(ProductService);
    
    // Set up products in the store for testing
    const testProduct = {
      id: '1',
      name: 'Test Product',
      img: 'test.jpg',
      availableAmount: 10,
      minOrderAmount: 1,
      price: 100
    };
    service['productsStore'].setProducts([testProduct]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('addToCart', () => {
    let testProduct: Product;

    beforeEach(() => {
      testProduct = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };
    });

    it('should add product to cart when amount is valid', () => {
      const result = service.addToCart(testProduct, 2);
      
      expect(result).toBe(true);
      expect(service.cartItems().length).toBe(1);
      expect(service.cartItems()[0].product).toEqual(testProduct);
      expect(service.cartItems()[0].quantity).toBe(2);
      // The product availability is updated in the store, not the original object
      const updatedProduct = service.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(8); // 10 - 2
    });

    it('should return false when amount is less than minOrderAmount', () => {
      const result = service.addToCart(testProduct, 0);
      
      expect(result).toBe(false);
      expect(service.cartItems().length).toBe(0);
      const updatedProduct = service.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(10); // unchanged
    });

    it('should return false when amount is greater than availableAmount', () => {
      const result = service.addToCart(testProduct, 15);
      
      expect(result).toBe(false);
      expect(service.cartItems().length).toBe(0);
      const updatedProduct = service.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(10); // unchanged
    });

    it('should update existing cart item quantity when product already exists', () => {
      // Add product first time
      service.addToCart(testProduct, 2);
      
      // Add same product again
      const result = service.addToCart(testProduct, 3);
      
      expect(result).toBe(true);
      expect(service.cartItems().length).toBe(1);
      expect(service.cartItems()[0].quantity).toBe(5); // 2 + 3
      const updatedProduct = service.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(5); // 10 - 2 - 3
    });

    it('should return false when adding to existing item would exceed available amount', () => {
      // Add product first time
      service.addToCart(testProduct, 2);
      
      // Try to add more than available
      const result = service.addToCart(testProduct, 9);
      
      expect(result).toBe(false);
      expect(service.cartItems()[0].quantity).toBe(2); // unchanged
      const updatedProduct = service.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(8); // only first addition applied
    });
  });

  describe('getCartItems', () => {
    it('should return empty array when cart is empty', () => {
      expect(service.getCartItems()).toEqual([]);
    });

    it('should return cart items as array', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      service.addToCart(testProduct, 2);
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].product).toEqual(testProduct);
      expect(cartItems[0].quantity).toBe(2);
    });
  });

  describe('cart signals', () => {
    it('should provide readonly access to cart items', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      service.addToCart(testProduct, 2);
      
      const cartItems = service.cartItems();
      expect(Array.isArray(cartItems)).toBe(true);
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].product).toEqual(testProduct);
      expect(cartItems[0].quantity).toBe(2);
    });

    it('should provide cart total quantity', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      service.addToCart(testProduct, 2);
      
      expect(service.cartTotalQuantity()).toBe(2);
    });

    it('should provide cart total price', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      service.addToCart(testProduct, 2);
      
      expect(service.cartTotalPrice()).toBe(200); // 2 * 100
    });
  });

  describe('updateCartItemQuantity', () => {
    let testProduct: Product;

    beforeEach(() => {
      testProduct = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };
      service.addToCart(testProduct, 2);
    });

    it('should update quantity successfully', () => {
      const result = service.updateCartItemQuantity('1', 3);
      
      expect(result).toBe(true);
      expect(service.cartItems()[0].quantity).toBe(3);
    });

    it('should return false for invalid quantity', () => {
      const result = service.updateCartItemQuantity('1', 0);
      
      expect(result).toBe(false);
      expect(service.cartItems()[0].quantity).toBe(2); // unchanged
    });

    it('should return false for non-existent product', () => {
      const result = service.updateCartItemQuantity('999', 3);
      
      expect(result).toBe(false);
    });
  });

  describe('removeFromCart', () => {
    let testProduct: Product;

    beforeEach(() => {
      testProduct = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };
      service.addToCart(testProduct, 2);
    });

    it('should remove item from cart', () => {
      service.removeFromCart('1');
      
      expect(service.cartItems().length).toBe(0);
    });

    it('should restore product availability when removing', () => {
      service.removeFromCart('1');
      
      const updatedProduct = service.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(10); // restored
    });
  });

  describe('clearCart', () => {
    let testProduct1: Product;
    let testProduct2: Product;

    beforeEach(() => {
      testProduct1 = {
        id: '1',
        name: 'Test Product 1',
        img: 'test1.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };
      testProduct2 = {
        id: '2',
        name: 'Test Product 2',
        img: 'test2.jpg',
        availableAmount: 5,
        minOrderAmount: 1,
        price: 200
      };
      service.addToCart(testProduct1, 2);
      service.addToCart(testProduct2, 1);
    });

    it('should clear all items from cart', () => {
      service.clearCart();
      
      expect(service.cartItems().length).toBe(0);
      expect(service.cartTotalQuantity()).toBe(0);
      expect(service.cartTotalPrice()).toBe(0);
    });

  });

  describe('getProductById', () => {
    beforeEach(() => {
      service['productsStore'].setProducts(mockProducts);
    });

    it('should return product by id', () => {
      const product = service.getProductById('1');
      
      expect(product).toEqual(mockProducts[0]);
    });

    it('should return undefined for non-existent product', () => {
      const product = service.getProductById('999');
      
      expect(product).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    beforeEach(() => {
      service['productsStore'].setProducts(mockProducts);
    });

    it('should return products matching category', () => {
      const products = service.getProductsByCategory('Product 1');
      
      expect(products.length).toBe(1);
      expect(products[0]).toEqual(mockProducts[0]);
    });

    it('should return empty array for non-matching category', () => {
      const products = service.getProductsByCategory('NonExistent');
      
      expect(products.length).toBe(0);
    });
  });
});
