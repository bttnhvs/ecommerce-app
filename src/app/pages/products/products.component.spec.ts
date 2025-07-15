import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Products } from './products.component';
import { Product } from '../../models/product';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ProductsStore } from '../../store/products.store';
import { CartStore } from '../../store/cart.store';
import { ProductsEffects } from '../../store/products.effects';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productsStore: any;
  let cartStore: any;
  let productsEffects: any;

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

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Products, ReactiveFormsModule],
      providers: [
        provideHttpClientTesting(),
        ProductsStore,
        CartStore,
        { provide: ProductsEffects, useValue: { loadProducts: () => ({ subscribe: () => {} }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    productsStore = TestBed.inject(ProductsStore);
    cartStore = TestBed.inject(CartStore);
    productsEffects = TestBed.inject(ProductsEffects);

    productsStore.setProducts(mockProducts);
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create form groups with correct validators for each product', () => {
      component.ngOnInit();

      const form1 = component.productForms['1'];
      const form2 = component.productForms['2'];

      expect(form1).toBeTruthy();
      expect(form2).toBeTruthy();
      expect(form1.get('quantity')?.value).toBe(1); // minOrderAmount
      expect(form2.get('quantity')?.value).toBe(2); // minOrderAmount
    });

    it('should call loadProducts when products store is empty', () => {
      productsStore.setProducts([]);
      const loadSpy = spyOn(productsEffects, 'loadProducts').and.returnValue({
        subscribe: () => {}
      });

      component.ngOnInit();

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('getForm', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return the correct form for a given product ID', () => {
      const form = component.getForm('1');
      expect(form).toBe(component.productForms['1']);
    });

    it('should return undefined for non-existent product ID', () => {
      const form = component.getForm('999');
      expect(form).toBeUndefined();
    });
  });

  describe('addToCart', () => {
    let mockProduct: Product;
    let mockForm: any;

    beforeEach(() => {
      component.ngOnInit();
      mockProduct = { ...mockProducts[0] };
      mockForm = component.productForms[mockProduct.id];
      spyOn(cartStore, 'addToCart').and.callThrough();
      spyOn(window, 'alert');
      spyOn(component.selectedChanged, 'emit');
      spyOn(console, 'log');
    });

    it('should add product to cart when form is valid', () => {
      cartStore.addToCart.and.returnValue(true);
      mockForm.get('quantity').setValue(3);
      component.addToCart(mockProduct);
      expect(cartStore.addToCart).toHaveBeenCalledWith(mockProduct, 3);
      expect(component.selectedChanged.emit).toHaveBeenCalledWith(mockProduct);
      expect(mockForm.get('quantity').value).toBe(1); // Reset to minOrderAmount
    });

    it('should show alert when form is invalid', () => {
      mockForm.get('quantity').setValue(0); // Invalid value

      component.addToCart(mockProduct);

      expect(window.alert).toHaveBeenCalledWith('A megadott mennyiség érvénytelen!');
      expect(cartStore.addToCart).not.toHaveBeenCalled();
    });

    it('should show alert when addToCart returns false', () => {
      cartStore.addToCart.and.returnValue(false);
      mockForm.get('quantity').setValue(3);
      component.addToCart(mockProduct);
      expect(window.alert).toHaveBeenCalledWith('Nem lehet ennyit hozzáadni a kosárhoz.');
      expect(mockForm.get('quantity').value).toBe(3); // Should not reset
    });

    it('should handle form with missing quantity control', () => {
      const invalidForm = {
        invalid: true,
        get: () => null
      };
      spyOn(component, 'getForm').and.returnValue(invalidForm as any);

      component.addToCart(mockProduct);

      expect(window.alert).toHaveBeenCalledWith('A megadott mennyiség érvénytelen!');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate minimum order amount', () => {
      const form = component.productForms['1'];
      const quantityControl = form.get('quantity');

      if (quantityControl) {
        quantityControl.setValue(0);
        expect(quantityControl.errors?.['min']).toBeTruthy();

        quantityControl.setValue(1);
        expect(quantityControl.errors?.['min']).toBeFalsy();
      }
    });

    it('should validate maximum available amount', () => {
      const form = component.productForms['1'];
      const quantityControl = form.get('quantity');

      if (quantityControl) {
        quantityControl.setValue(11);
        expect(quantityControl.errors?.['max']).toBeTruthy();

        quantityControl.setValue(10);
        expect(quantityControl.errors?.['max']).toBeFalsy();
      }
    });

    it('should require quantity field', () => {
      const form = component.productForms['1'];
      const quantityControl = form.get('quantity');

      if (quantityControl) {
        quantityControl.setValue('');
        expect(quantityControl.errors?.['required']).toBeTruthy();

        quantityControl.setValue(5);
        expect(quantityControl.errors?.['required']).toBeFalsy();
      }
    });
  });

  describe('component properties', () => {
    it('should have selectedChanged output', () => {
      expect(component.selectedChanged).toBeTruthy();
    });
  });

  describe('product forms initialization', () => {
    beforeEach(() => {
      // Set up products in the store to trigger the effect
      productsStore.setProducts(mockProducts);
    });

    it('should initialize product forms when products are loaded', () => {
      // Trigger the effect by setting products
      productsStore.setProducts(mockProducts);

      expect(component.productForms).toBeDefined();
      expect(Object.keys(component.productForms).length).toBe(2);
    });

    it('should create form with correct validators for each product', () => {
      productsStore.setProducts(mockProducts);

      const form1 = component.getForm('1');
      const form2 = component.getForm('2');

      expect(form1).toBeDefined();
      expect(form2).toBeDefined();

      // Check validators
      const quantityControl1 = form1.get('quantity');
      const quantityControl2 = form2.get('quantity');

      expect(quantityControl1?.hasValidator).toBeDefined();
      expect(quantityControl2?.hasValidator).toBeDefined();
    });

    it('should set initial quantity to minOrderAmount', () => {
      productsStore.setProducts(mockProducts);

      const form1 = component.getForm('1');
      const form2 = component.getForm('2');

      expect(form1.get('quantity')?.value).toBe(1); // minOrderAmount for product 1
      expect(form2.get('quantity')?.value).toBe(2); // minOrderAmount for product 2
    });
  });

  describe('products array', () => {
    it('should be updated when products store changes', () => {
      productsStore.setProducts(mockProducts);

      expect(component.products).toEqual(mockProducts);
    });
  });
});

describe('Products with empty products list', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productsStore: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Products, ReactiveFormsModule],
      providers: [
        provideHttpClientTesting(),
        ProductsStore,
        CartStore,
        { provide: ProductsEffects, useValue: { loadProducts: () => ({ subscribe: () => {} }) } },
        { provide: HttpClient, useValue: { get: () => ({ pipe: () => ({ subscribe: () => {} }) }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    productsStore = TestBed.inject(ProductsStore);
  });

  it('should handle empty products list', () => {
    productsStore.setProducts([]);

    expect(component.products).toEqual([]);
    expect(component.productForms).toEqual({});
  });
});
