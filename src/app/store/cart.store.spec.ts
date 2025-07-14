import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';
import { ProductsStore } from './products.store';
import { Product } from '../models/product';

describe('CartStore', () => {
  let cartStore: any;
  let productsStore: any;

  const mockProduct1: Product = {
    id: '1',
    name: 'Test Product 1',
    img: 'test1.jpg',
    availableAmount: 10,
    minOrderAmount: 1,
    price: 100
  };

  const mockProduct2: Product = {
    id: '2',
    name: 'Test Product 2',
    img: 'test2.jpg',
    availableAmount: 5,
    minOrderAmount: 2,
    price: 200
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartStore, ProductsStore]
    });
    cartStore = TestBed.inject(CartStore);
    productsStore = TestBed.inject(ProductsStore);

    productsStore.setProducts([mockProduct1, mockProduct2]);
  });

  it('should be created', () => {
    expect(cartStore).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty items array', () => {
      expect(cartStore.items()).toEqual([]);
    });

    it('should have zero total quantity', () => {
      expect(cartStore.totalQuantity()).toBe(0);
    });

    it('should have zero total price', () => {
      expect(cartStore.totalPrice()).toBe(0);
    });


    it('should have zero item count', () => {
      expect(cartStore.itemCount()).toBe(0);
    });
  });

  describe('addToCart', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
    });

    it('should add product to cart when quantity is valid', () => {
      const result = cartStore.addToCart(mockProduct1, 2);

      expect(result).toBe(true);
      expect(cartStore.items().length).toBe(1);
      expect(cartStore.items()[0].product).toEqual(mockProduct1);
      expect(cartStore.items()[0].quantity).toBe(2);
      expect(cartStore.totalQuantity()).toBe(2);
      expect(cartStore.totalPrice()).toBe(200);
    });

    it('should return false when quantity is less than minOrderAmount', () => {
      const result = cartStore.addToCart(mockProduct1, 0);

      expect(result).toBe(false);
      expect(cartStore.items().length).toBe(0);
      expect(cartStore.totalQuantity()).toBe(0);
    });

    it('should return false when quantity is greater than availableAmount', () => {
      const result = cartStore.addToCart(mockProduct1, 15);

      expect(result).toBe(false);
      expect(cartStore.items().length).toBe(0);
      expect(cartStore.totalQuantity()).toBe(0);
    });

    it('should update existing item quantity when product already exists', () => {
      cartStore.addToCart(mockProduct1, 2);
      const result = cartStore.addToCart(mockProduct1, 3);

      expect(result).toBe(true);
      expect(cartStore.items().length).toBe(1);
      expect(cartStore.items()[0].quantity).toBe(5);
      expect(cartStore.totalQuantity()).toBe(5);
      expect(cartStore.totalPrice()).toBe(500);
    });

    it('should return false when adding to existing item would exceed available amount', () => {
      cartStore.addToCart(mockProduct1, 2);
      const result = cartStore.addToCart(mockProduct1, 9);

      expect(result).toBe(false);
      expect(cartStore.items()[0].quantity).toBe(2);
      expect(cartStore.totalQuantity()).toBe(2);
    });

    it('should update product availability when adding to cart', () => {
      cartStore.addToCart(mockProduct1, 3);
      const updatedProduct = productsStore.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(7);
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
      cartStore.addToCart(mockProduct1, 3);
      cartStore.addToCart(mockProduct2, 2);
    });

    it('should remove item from cart', () => {
      cartStore.removeFromCart('1');

      expect(cartStore.items().length).toBe(1);
      expect(cartStore.items()[0].product.id).toBe('2');
      expect(cartStore.totalQuantity()).toBe(2);
      expect(cartStore.totalPrice()).toBe(400);
    });

    it('should restore product availability when removing', () => {
      cartStore.removeFromCart('1');
      const updatedProduct = productsStore.getProductById('1');
      expect(updatedProduct?.availableAmount).toBe(10);
    });

    it('should do nothing when removing non-existent product', () => {
      const originalItems = cartStore.items();
      const originalQuantity = cartStore.totalQuantity();
      cartStore.removeFromCart('999');
      expect(cartStore.items()).toEqual(originalItems);
      expect(cartStore.totalQuantity()).toBe(originalQuantity);
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
      cartStore.addToCart(mockProduct1, 3);
    });

    it('should update quantity successfully', () => {
      const result = cartStore.updateQuantity('1', 4);

      expect(result).toBe(true);
      expect(cartStore.items()[0].quantity).toBe(4);
      expect(cartStore.totalQuantity()).toBe(4);
      expect(cartStore.totalPrice()).toBe(400);
    });

    it('should return false for invalid quantity', () => {
      const result = cartStore.updateQuantity('1', 0);
      expect(result).toBe(false);
      expect(cartStore.items()[0].quantity).toBe(3);
    });

    it('should return false when new quantity exceeds available amount', () => {
      const result = cartStore.updateQuantity('1', 12);
      expect(result).toBe(false);
      expect(cartStore.items()[0].quantity).toBe(3);
    });

    it('should return false for non-existent product', () => {
      const result = cartStore.updateQuantity('999', 4);
      expect(result).toBe(false);
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
      cartStore.addToCart(mockProduct1, 3);
      cartStore.addToCart(mockProduct2, 2);
    });

    it('should clear all items from cart', () => {
      cartStore.clearCart();

      expect(cartStore.items().length).toBe(0);
      expect(cartStore.totalQuantity()).toBe(0);
      expect(cartStore.totalPrice()).toBe(0);
      expect(cartStore.itemCount()).toBe(0);
    });

    it('should restore all product availability', () => {
      cartStore.clearCart();

      const updatedProduct1 = productsStore.getProductById('1');
      const updatedProduct2 = productsStore.getProductById('2');
      expect(updatedProduct1?.availableAmount).toBe(10);
      expect(updatedProduct2?.availableAmount).toBe(5);
    });
  });

  describe('getItemQuantity', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
      cartStore.addToCart(mockProduct1, 3);
    });

    it('should return quantity for existing item', () => {
      expect(cartStore.getItemQuantity('1')).toBe(3);
    });

    it('should return zero for non-existent item', () => {
      expect(cartStore.getItemQuantity('999')).toBe(0);
    });
  });

  describe('isInCart', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
      cartStore.addToCart(mockProduct1, 3);
    });

    it('should return true for existing item', () => {
      expect(cartStore.isInCart('1')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      expect(cartStore.isInCart('999')).toBe(false);
    });
  });

  describe('getCartItem', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
      cartStore.addToCart(mockProduct1, 3);
    });

    it('should return cart item for existing product', () => {
      const item = cartStore.getCartItem('1');
      expect(item).toBeDefined();
      expect(item?.product).toEqual(mockProduct1);
      expect(item?.quantity).toBe(3);
    });

    it('should return undefined for non-existent product', () => {
      const item = cartStore.getCartItem('999');
      expect(item).toBeUndefined();
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      productsStore.setProducts([mockProduct1, mockProduct2]);
    });

    it('should calculate total quantity correctly with multiple items', () => {
      cartStore.addToCart(mockProduct1, 2);
      cartStore.addToCart(mockProduct2, 3);

      expect(cartStore.totalQuantity()).toBe(5);
    });

    it('should calculate total price correctly with multiple items', () => {
      cartStore.addToCart(mockProduct1, 2);
      cartStore.addToCart(mockProduct2, 3);

      expect(cartStore.totalPrice()).toBe(800);
    });

    it('should handle zero quantity items in calculations', () => {
      cartStore.addToCart(mockProduct1, 0);
      cartStore.addToCart(mockProduct2, 0);

      expect(cartStore.totalQuantity()).toBe(0);
      expect(cartStore.totalPrice()).toBe(0);
    });

  });
});
