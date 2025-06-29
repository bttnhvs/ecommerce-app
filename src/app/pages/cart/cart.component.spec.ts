import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cart } from './cart.component';
import { ProductService } from '../../service/product.service';
import { CartItem } from '../../models/cart';
import { Product } from '../../models/product';
import { of } from 'rxjs';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let productService: jasmine.SpyObj<ProductService>;

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

  const mockCartItems: CartItem[] = [
    { product: mockProduct1, quantity: 2 },
    { product: mockProduct2, quantity: 1 }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', [
      'getCartItems', 
      'updateCartItemQuantity', 
      'removeFromCart', 
      'clearCart'
    ], {
      cartItems$: of(mockCartItems),
      cartItems: mockCartItems
    });

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: ProductService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize cart items and calculate totals', () => {
      component.ngOnInit();

      expect(component.cartItems).toEqual(mockCartItems);
      expect(component.totalAmount).toBe(3); // 2 + 1
      expect(component.totalPrice).toBe(400); // (2 * 100) + (1 * 200)
    });
  });

  describe('cart calculations', () => {
    it('should calculate total amount correctly', () => {
      component.cartItems = mockCartItems;
      component.totalAmount = component.cartItems.reduce((acc, item) => acc + item.quantity, 0);

      expect(component.totalAmount).toBe(3);
    });

    it('should calculate total price correctly', () => {
      component.cartItems = mockCartItems;
      component.totalPrice = component.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);

      expect(component.totalPrice).toBe(400);
    });

    it('should handle zero quantity items', () => {
      const zeroQuantityItems: CartItem[] = [
        { product: mockProduct1, quantity: 0 },
        { product: mockProduct2, quantity: 0 }
      ];

      component.cartItems = zeroQuantityItems;
      component.totalAmount = component.cartItems.reduce((acc, item) => acc + item.quantity, 0);
      component.totalPrice = component.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);

      expect(component.totalAmount).toBe(0);
      expect(component.totalPrice).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    let testItem: CartItem;

    beforeEach(() => {
      testItem = { product: mockProduct1, quantity: 2 };
    });

    it('should increase quantity when change is positive', () => {
      component.updateQuantity(testItem, 1);

      expect(productService.updateCartItemQuantity).toHaveBeenCalledWith(testItem.product.id, 3);
    });

    it('should decrease quantity when change is negative', () => {
      component.updateQuantity(testItem, -1);

      expect(productService.updateCartItemQuantity).toHaveBeenCalledWith(testItem.product.id, 1);
    });

    it('should remove item when new quantity would be less than 1', () => {
      component.updateQuantity(testItem, -2);

      expect(productService.removeFromCart).toHaveBeenCalledWith(testItem.product.id);
    });

    it('should not update when new quantity exceeds available amount', () => {
      testItem.quantity = 10; // Already at max
      component.updateQuantity(testItem, 1);

      expect(productService.updateCartItemQuantity).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should call removeFromCart on service', () => {
      const testItem: CartItem = { product: mockProduct1, quantity: 2 };
      
      component.removeItem(testItem);

      expect(productService.removeFromCart).toHaveBeenCalledWith(testItem.product.id);
    });
  });

  describe('clearCart', () => {
    it('should call clearCart on service', () => {
      component.clearCart();

      expect(productService.clearCart).toHaveBeenCalled();
    });
  });

  describe('component properties', () => {
    it('should have cartItems array', () => {
      expect(Array.isArray(component.cartItems)).toBe(true);
    });

    it('should have totalAmount number', () => {
      expect(typeof component.totalAmount).toBe('number');
    });

    it('should have totalPrice number', () => {
      expect(typeof component.totalPrice).toBe('number');
    });
  });

  describe('subscription management', () => {
    it('should unsubscribe on destroy', () => {
      const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});

describe('Cart with empty cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

  beforeEach(async () => {
    const emptyCartSpy = jasmine.createSpyObj('ProductService', [
      'getCartItems', 
      'updateCartItemQuantity', 
      'removeFromCart', 
      'clearCart'
    ], {
      cartItems$: of([]),
      cartItems: []
    });

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: ProductService, useValue: emptyCartSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
  });

  it('should handle empty cart', () => {
    component.ngOnInit();

    expect(component.cartItems).toEqual([]);
    expect(component.totalAmount).toBe(0);
    expect(component.totalPrice).toBe(0);
  });
});

describe('Cart with multiple items', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

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

  beforeEach(async () => {
    const multipleItems: CartItem[] = [
      { product: mockProduct1, quantity: 3 },
      { product: mockProduct2, quantity: 2 }
    ];

    const multipleItemsSpy = jasmine.createSpyObj('ProductService', [
      'getCartItems', 
      'updateCartItemQuantity', 
      'removeFromCart', 
      'clearCart'
    ], {
      cartItems$: of(multipleItems),
      cartItems: multipleItems
    });

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: ProductService, useValue: multipleItemsSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
  });

  it('should calculate totals correctly with multiple items', () => {
    component.ngOnInit();

    expect(component.totalAmount).toBe(5); // 3 + 2
    expect(component.totalPrice).toBe(700); // (3 * 100) + (2 * 200)
  });
});
