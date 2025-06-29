import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product';
import { provideHttpClient } from '@angular/common/http';

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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchProducts', () => {
    it('should fetch products from API and update products signal', () => {
      // Mock the HTTP call since we can't use HttpClientTestingModule in Angular 19
      spyOn(service['http'], 'get').and.returnValue({
        subscribe: (callback: any) => callback(mockProducts)
      } as any);

      service.fetchProducts();

      expect(service.products()).toEqual(mockProducts);
    });

    it('should handle API error gracefully', () => {
      spyOn(service['http'], 'get').and.returnValue({
        subscribe: (callback: any, errorCallback: any) => {
          if (errorCallback) {
            errorCallback(new Error('Network error'));
          }
        }
      } as any);

      service.fetchProducts();

      expect(service.products()).toEqual([]);
    });
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
      expect(testProduct.availableAmount).toBe(8); // 10 - 2
    });

    it('should return false when amount is less than minOrderAmount', () => {
      const result = service.addToCart(testProduct, 0);
      
      expect(result).toBe(false);
      expect(service.cartItems().length).toBe(0);
      expect(testProduct.availableAmount).toBe(10); // unchanged
    });

    it('should return false when amount is greater than availableAmount', () => {
      const result = service.addToCart(testProduct, 15);
      
      expect(result).toBe(false);
      expect(service.cartItems().length).toBe(0);
      expect(testProduct.availableAmount).toBe(10); // unchanged
    });

    it('should update existing cart item quantity when product already exists', () => {
      // Add product first time
      service.addToCart(testProduct, 2);
      
      // Add same product again
      const result = service.addToCart(testProduct, 3);
      
      expect(result).toBe(true);
      expect(service.cartItems().length).toBe(1);
      expect(service.cartItems()[0].quantity).toBe(5); // 2 + 3
      expect(testProduct.availableAmount).toBe(5); // 10 - 2 - 3
    });

    it('should return false when adding to existing item would exceed available amount', () => {
      // Add product first time
      service.addToCart(testProduct, 2);
      
      // Try to add more than available
      const result = service.addToCart(testProduct, 9);
      
      expect(result).toBe(false);
      expect(service.cartItems()[0].quantity).toBe(2); // unchanged
      expect(testProduct.availableAmount).toBe(8); // only first addition applied
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

  describe('cart signal', () => {
    it('should provide readonly access to cart', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        img: 'test.jpg',
        availableAmount: 10,
        minOrderAmount: 1,
        price: 100
      };

      service.addToCart(testProduct, 2);
      
      const cart = service.cart();
      expect(cart).toBeInstanceOf(Map);
      expect(cart.has(testProduct.id)).toBe(true);
    });
  });
});
