import { Product } from './product';

describe('Product', () => {
  it('should create a valid product object', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      img: 'test.jpg',
      availableAmount: 10,
      minOrderAmount: 1,
      price: 100
    };

    expect(product.id).toBe('1');
    expect(product.name).toBe('Test Product');
    expect(product.img).toBe('test.jpg');
    expect(product.availableAmount).toBe(10);
    expect(product.minOrderAmount).toBe(1);
    expect(product.price).toBe(100);
  });

  it('should have all required properties', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      img: 'test.jpg',
      availableAmount: 10,
      minOrderAmount: 1,
      price: 100
    };

    expect(product.hasOwnProperty('id')).toBe(true);
    expect(product.hasOwnProperty('name')).toBe(true);
    expect(product.hasOwnProperty('img')).toBe(true);
    expect(product.hasOwnProperty('availableAmount')).toBe(true);
    expect(product.hasOwnProperty('minOrderAmount')).toBe(true);
    expect(product.hasOwnProperty('price')).toBe(true);
  });

  it('should allow zero values for amounts', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      img: 'test.jpg',
      availableAmount: 0,
      minOrderAmount: 0,
      price: 0
    };

    expect(product.availableAmount).toBe(0);
    expect(product.minOrderAmount).toBe(0);
    expect(product.price).toBe(0);
  });

  it('should allow decimal prices', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      img: 'test.jpg',
      availableAmount: 10,
      minOrderAmount: 1,
      price: 99.99
    };

    expect(product.price).toBe(99.99);
  });

  it('should allow large numbers', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      img: 'test.jpg',
      availableAmount: 999999,
      minOrderAmount: 1,
      price: 999999.99
    };

    expect(product.availableAmount).toBe(999999);
    expect(product.price).toBe(999999.99);
  });
}); 