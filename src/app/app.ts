import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from './service/product.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  protected title = 'ecommerce-app';
  
  private readonly productService: ProductService = inject(ProductService);

  protected cartItemCount = computed(() => {
    const cartItems = this.productService.cartItems();
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  });
}
