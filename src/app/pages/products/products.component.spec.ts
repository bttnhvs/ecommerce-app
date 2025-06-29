import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Products } from './products.component';
import { ProductService } from '../../service/product.service';
import { Product } from '../../models/product';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productService: jasmine.SpyObj<ProductService>;

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
    const spy = jasmine.createSpyObj('ProductService', ['fetchProducts', 'addToCart'], {
      products: () => mockProducts
    });

    await TestBed.configureTestingModule({
      imports: [Products, ReactiveFormsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: ProductService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch products and initialize forms', () => {
      spyOn(window, 'alert'); // Spy on alert to prevent it from showing during tests
      
      component.ngOnInit();

      expect(productService.fetchProducts).toHaveBeenCalled();
      expect(component.products).toEqual(mockProducts);
      expect(Object.keys(component.productForms).length).toBe(2);
    });

    it('should create form groups with correct validators for each product', () => {
      component.ngOnInit();

      const form1 = component.productForms['1'];
      const form2 = component.productForms['2'];

      expect(form1).toBeTruthy();
      expect(form2).toBeTruthy();
      expect(form1.get('quantity')?.value).toBe(1); // minOrderAmount
      expect(form2.get('quantity')?.value).toBe(2); // minOrderAmount
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
      
      spyOn(window, 'alert');
      spyOn(component.selectedChanged, 'emit');
      spyOn(console, 'log');
    });

    it('should add product to cart when form is valid', () => {
      productService.addToCart.and.returnValue(true);
      mockForm.get('quantity').setValue(3);

      component.addToCart(mockProduct);

      expect(productService.addToCart).toHaveBeenCalledWith(mockProduct, 3);
      expect(component.selectedChanged.emit).toHaveBeenCalledWith(mockProduct);
      expect(mockForm.get('quantity').value).toBe(1); // Reset to minOrderAmount
    });

    it('should show alert when form is invalid', () => {
      mockForm.get('quantity').setValue(0); // Invalid value

      component.addToCart(mockProduct);

      expect(window.alert).toHaveBeenCalledWith('A megadott mennyiség érvénytelen!');
      expect(productService.addToCart).not.toHaveBeenCalled();
    });

    it('should show alert when addToCart returns false', () => {
      productService.addToCart.and.returnValue(false);
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
});
