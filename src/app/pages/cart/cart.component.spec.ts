import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cart } from './cart.component';
import { CartStore } from '../../store/cart.store';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

// Mock CartStore
class MockCartStore {
  items = jasmine.createSpy().and.returnValue([]);
  totalQuantity = jasmine.createSpy().and.returnValue(0);
  totalPrice = jasmine.createSpy().and.returnValue(0);
  isEmpty = jasmine.createSpy().and.returnValue(true);
  itemCount = jasmine.createSpy().and.returnValue(0);
  updateQuantity = jasmine.createSpy();
  removeFromCart = jasmine.createSpy();
  clearCart = jasmine.createSpy();
}

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartStore: MockCartStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart, CommonModule, RouterLink],
      providers: [
        { provide: CartStore, useClass: MockCartStore },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    cartStore = TestBed.inject(CartStore) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateQuantity on store when updateQuantity is called', () => {
    const item = { product: { id: '1', availableAmount: 10 }, quantity: 2 };
    component.updateQuantity(item as any, 1);
    expect(cartStore.updateQuantity).toHaveBeenCalledWith('1', 3);
  });

  it('should call removeItem if new quantity < 1', () => {
    spyOn(component, 'removeItem');
    const item = { product: { id: '1', availableAmount: 10 }, quantity: 1 };
    component.updateQuantity(item as any, -1);
    expect(component.removeItem).toHaveBeenCalledWith(item as any);
  });

  it('should not update quantity if new quantity > availableAmount', () => {
    const item = { product: { id: '1', availableAmount: 2 }, quantity: 2 };
    component.updateQuantity(item as any, 2);
    expect(cartStore.updateQuantity).not.toHaveBeenCalled();
  });

  it('should call removeFromCart on store when removeItem is called', () => {
    const item = { product: { id: '1' } };
    component.removeItem(item as any);
    expect(cartStore.removeFromCart).toHaveBeenCalledWith('1');
  });

  it('should call clearCart on store when clearCart is called', () => {
    component.clearCart();
    expect(cartStore.clearCart).toHaveBeenCalled();
  });
}); 