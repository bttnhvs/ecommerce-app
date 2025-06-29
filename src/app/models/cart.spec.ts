import { CartItem } from './cart';
import { Product } from './product';

describe('CartItem', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    img: 'test.jpg',
    availableAmount: 10,
    minOrderAmount: 1,
    price: 100
  };

  it('should create a valid cart item object', () => {
    const cartItem: CartItem = {
      product: mockProduct,
      quantity: 2
    };

    expect(cartItem.product).toEqual(mockProduct);
    expect(cartItem.quantity).toBe(2);
  });

  it('should have all required properties', () => {
    const cartItem: CartItem = {
      product: mockProduct,
      quantity: 1
    };

    expect(cartItem.hasOwnProperty('product')).toBe(true);
    expect(cartItem.hasOwnProperty('quantity')).toBe(true);
  });

  it('should allow zero quantity', () => {
    const cartItem: CartItem = {
      product: mockProduct,
      quantity: 0
    };

    expect(cartItem.quantity).toBe(0);
  });

  it('should allow large quantities', () => {
    const cartItem: CartItem = {
      product: mockProduct,
      quantity: 999999
    };

    expect(cartItem.quantity).toBe(999999);
  });

  it('should reference the correct product', () => {
    const cartItem: CartItem = {
      product: mockProduct,
      quantity: 1
    };

    expect(cartItem.product.id).toBe('1');
    expect(cartItem.product.name).toBe('Test Product');
    expect(cartItem.product.price).toBe(100);
  });

  it('should allow multiple cart items with different products', () => {
    const product2: Product = {
      id: '2',
      name: 'Test Product 2',
      img: 'test2.jpg',
      availableAmount: 5,
      minOrderAmount: 1,
      price: 200
    };

    const cartItem1: CartItem = {
      product: mockProduct,
      quantity: 2
    };

    const cartItem2: CartItem = {
      product: product2,
      quantity: 1
    };

    expect(cartItem1.product.id).toBe('1');
    expect(cartItem2.product.id).toBe('2');
    expect(cartItem1.quantity).toBe(2);
    expect(cartItem2.quantity).toBe(1);
  });
}); 