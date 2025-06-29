import {Component, inject, OnInit, output, OutputEmitterRef} from '@angular/core';
import {FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Product } from '../../models/product';
import { ProductService } from '../../service/product.service';
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
  private readonly productStore: ProductService = inject(ProductService);
  public readonly selectedChanged: OutputEmitterRef<Product> = output();

  ngOnInit(): void {
    this.productStore.fetchProducts();
    const data = this.productStore.products();
    this.products = data;
    this.products.forEach(product => {
      this.productForms[product.id] = new FormGroup({
        quantity: new FormControl(
          product.minOrderAmount,
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
    const success = this.productStore.addToCart(product, amount);
    console.log(success);
    if (!success) {
      alert('Nem lehet ennyit hozzáadni a kosárhoz.');
    } else {
      form.get('quantity')?.setValue(product.minOrderAmount);
    }
  }
}


