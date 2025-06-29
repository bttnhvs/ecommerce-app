import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './service/product.service';
import { of, BehaviorSubject } from 'rxjs';

describe('App', () => {
  let cartItemsSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    cartItemsSubject = new BehaviorSubject<any[]>([]);
    const mockProductService = jasmine.createSpyObj('ProductService', [
      'fetchProducts', 
      'addToCart', 
      'getCartItems', 
      'updateCartItemQuantity', 
      'removeFromCart', 
      'clearCart'
    ], {
      products$: of([]),
      cartItems$: cartItemsSubject.asObservable(),
      products: [],
      cart: new Map(),
      cartItems: []
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ProductService, useValue: mockProductService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink="/products"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink="/cart"]')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should update cart item count when cart items change', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Emit new cart items
    const mockCartItems = [
      { product: { id: '1', name: 'Product 1' }, quantity: 2 },
      { product: { id: '2', name: 'Product 2' }, quantity: 3 }
    ];
    cartItemsSubject.next(mockCartItems);
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect((app as any).cartItemCount).toBe(5); // 2 + 3
  });
});
