import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from './service/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App implements OnInit, OnDestroy {
  protected title = 'ecommerce-app';
  
  private readonly productService: ProductService = inject(ProductService);
  private subscription: Subscription = new Subscription();

  protected cartItemCount: number = 0;

  ngOnInit(): void {
    // Subscribe to cart items changes to update cart item count
    this.subscription.add(
      this.productService.cartItems$.subscribe(items => {
        this.cartItemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
