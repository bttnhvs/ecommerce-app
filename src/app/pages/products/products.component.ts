import {Component, inject, OnInit, output, OutputEmitterRef, effect} from '@angular/core';
import {FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Product } from '../../models/product';
import { ProductsStore } from '../../store/products.store';
import { CartStore } from '../../store/cart.store';
import { ProductsEffects } from '../../store/products.effects';
import {CommonModule} from '@angular/common';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  standalone: true,
  styleUrl: './products.component.scss'
})
export class Products implements OnInit {
  products: Product[] = [];
  productForms: { [productId: string]: FormGroup } = {};

  private readonly productsStore = inject(ProductsStore);
  private readonly cartStore = inject(CartStore);
  private readonly productsEffects = inject(ProductsEffects);

  public readonly selectedChanged: OutputEmitterRef<Product> = output();

  constructor() {
    // Set up an effect to watch for changes in the products signal
    effect(() => {
      const products = this.productsStore.products();
      if (products.length > 0) {
        this.products = products;
        this.initializeProductForms();
      }
    });
  }

  ngOnInit(): void {
    this.productsEffects.loadProducts().subscribe();
  }

  private initializeProductForms(): void {
    this.productForms = {};
    this.products.forEach(product => {
      this.productForms[product.id] = new FormGroup({
        quantity: new FormControl(
          {value: product.minOrderAmount,  disabled: product.availableAmount === 0},
          [
            Validators.required,
            Validators.min(product.minOrderAmount),
            Validators.max(product.availableAmount)
          ]
        )
      });
    });
  }

  getForm(productId: string): FormGroup {
    return this.productForms[productId];
  }

  addToCart(product: Product): void {
    const form = this.getForm(product.id);
    const amount = form.get('quantity')?.value;

    if (form.invalid) {
      alert('A megadott mennyiség érvénytelen!');
      return;
    }

    this.selectedChanged.emit(product);
    console.log(product);

    const success = this.cartStore.addToCart(product, amount);
    console.log(success);

    if (!success) {
      alert('Nem lehet ennyit hozzáadni a kosárhoz.');
    } else {
      form.get('quantity')?.setValue(product.minOrderAmount);
    }
  }
}


