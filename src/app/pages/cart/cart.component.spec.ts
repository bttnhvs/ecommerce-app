import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cart } from './cart.component';
import { ProductService } from '../../service/product.service';
import { CartItem } from '../../models/cart';
import { Product } from '../../models/product';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
    const spy = jasmine.createSpyObj('ProductService', ['getCartItems']);
    spy.getCartItems.and.returnValue(mockCartItems);

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideHttpClientTesting(),
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

  describe('service integration', () => {
    it('should call getCartItems from ProductService', () => {
      component.ngOnInit();
      
      expect(productService.getCartItems).toHaveBeenCalled();
    });
  });
});

describe('Cart with empty cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

  beforeEach(async () => {
    const emptyCartSpy = jasmine.createSpyObj('ProductService', ['getCartItems']);
    emptyCartSpy.getCartItems.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideHttpClientTesting(),
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

    const multipleItemsSpy = jasmine.createSpyObj('ProductService', ['getCartItems']);
    multipleItemsSpy.getCartItems.and.returnValue(multipleItems);

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideHttpClientTesting(),
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
