import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { take, skip } from 'rxjs/operators';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

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
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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
      
      // Initialize products by directly setting them instead of making HTTP request
      service['_state'].next({
        products: [testProduct],
        cart: new Map()
      });
    });

    it('should add product to cart when amount is valid', () => {
      const result = service.addToCart(testProduct, 2);
      
      expect(result).toBe(true);
      expect(service.cartItems.length).toBe(1);
      expect(service.cartItems[0].product).toEqual(testProduct);
      expect(service.cartItems[0].quantity).toBe(2);
      expect(service.products[0].availableAmount).toBe(8); // 10 - 2
    });

    it('should return false when amount is less than minOrderAmount', () => {
      const result = service.addToCart(testProduct, 0);
      
      expect(result).toBe(false);
      expect(service.cartItems.length).toBe(0);
      expect(service.products[0].availableAmount).toBe(10); // unchanged
    });

    it('should return false when amount is greater than availableAmount', () => {
      const result = service.addToCart(testProduct, 15);
      
      expect(result).toBe(false);
      expect(service.cartItems.length).toBe(0);
      expect(service.products[0].availableAmount).toBe(10); // unchanged
    });

    it('should update existing cart item quantity when product already exists', () => {
      // Add product first time
      service.addToCart(testProduct, 2);
      
      // Add same product again
      const result = service.addToCart(testProduct, 3);
      
      expect(result).toBe(true);
      expect(service.cartItems.length).toBe(1);
      expect(service.cartItems[0].quantity).toBe(5); // 2 + 3
      expect(service.products[0].availableAmount).toBe(5); // 10 - 2 - 3
    });

    it('should return false when adding to existing item would exceed available amount', () => {
      // Add product first time
      service.addToCart(testProduct, 2);
      
      // Try to add more than available
      const result = service.addToCart(testProduct, 9);
      
      expect(result).toBe(false);
      expect(service.cartItems[0].quantity).toBe(2); // unchanged
      expect(service.products[0].availableAmount).toBe(8); // only first addition applied
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

      // Initialize products by directly setting them
      service['_state'].next({
        products: [testProduct],
        cart: new Map()
      });

      service.addToCart(testProduct, 2);
      
      const cartItems = service.getCartItems();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].product).toEqual(testProduct);
      expect(cartItems[0].quantity).toBe(2);
    });
  });

  describe('cart getter', () => {
    it('should provide readonly access to cart', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      // Initialize products by directly setting them
      service['_state'].next({
        products: [testProduct],
        cart: new Map()
      });

      service.addToCart(testProduct, 2);
      
      const cart = service.cart;
      expect(cart).toBeInstanceOf(Map);
      expect(cart.has(testProduct.id)).toBe(true);
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
      
      // Initialize products by directly setting them
      service['_state'].next({
        products: [testProduct],
        cart: new Map()
      });
      
      service.addToCart(testProduct, 2);
    });

    it('should update cart item quantity', () => {
      service.updateCartItemQuantity(testProduct.id, 5);
      
      expect(service.cartItems[0].quantity).toBe(5);
      expect(service.products[0].availableAmount).toBe(5); // 10 - 5
    });

    it('should remove item when quantity is 0 or negative', () => {
      service.updateCartItemQuantity(testProduct.id, 0);
      
      expect(service.cartItems.length).toBe(0);
      expect(service.products[0].availableAmount).toBe(10); // restored
    });

    it('should not update when quantity exceeds available amount', () => {
      service.updateCartItemQuantity(testProduct.id, 15);
      
      expect(service.cartItems[0].quantity).toBe(2); // unchanged
      expect(service.products[0].availableAmount).toBe(8); // unchanged
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
      
      // Initialize products by directly setting them
      service['_state'].next({
        products: [testProduct],
        cart: new Map()
      });
      
      service.addToCart(testProduct, 3);
    });

    it('should remove item from cart and restore available amount', () => {
      service.removeFromCart(testProduct.id);
      
      expect(service.cartItems.length).toBe(0);
      expect(service.products[0].availableAmount).toBe(10); // restored
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
      
      // Initialize products by directly setting them
      service['_state'].next({
        products: [testProduct1, testProduct2],
        cart: new Map()
      });
      
      service.addToCart(testProduct1, 2);
      service.addToCart(testProduct2, 1);
    });

    it('should clear all items from cart and restore available amounts', () => {
      service.clearCart();
      
      expect(service.cartItems.length).toBe(0);
      expect(service.products[0].availableAmount).toBe(10); // restored
      expect(service.products[1].availableAmount).toBe(5); // restored
    });
  });

  describe('observables', () => {
    it('should emit products through products$ observable', (done) => {
      // Update state first, then subscribe
      service['_state'].next({
        products: mockProducts,
        cart: new Map()
      });

      // Subscribe after state is updated
      service.products$.pipe(take(1)).subscribe(products => {
        expect(products).toEqual(mockProducts);
        done();
      });
    });

    it('should emit cart items through cartItems$ observable', (done) => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      // Initialize products by directly setting them
      service['_state'].next({
        products: [testProduct],
        cart: new Map()
      });

      // Then subscribe to cart items and add to cart
      service.cartItems$.pipe(skip(1), take(1)).subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].product).toEqual(testProduct);
        expect(items[0].quantity).toBe(2);
        done();
      });
      
      service.addToCart(testProduct, 2);
    });
  });
});
