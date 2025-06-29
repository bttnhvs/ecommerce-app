import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ProductService } from "../../service/product.service";
import { CartItem } from "../../models/cart";
import { Subscription, map } from "rxjs";

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: true,
})

export class Cart implements OnInit, OnDestroy {  
  private readonly productService: ProductService = inject(ProductService);
  private subscription: Subscription = new Subscription();
  
  // Reactive cart items
  cartItems: CartItem[] = [];
  
  // Computed totals
  totalAmount: number = 0;
  totalPrice: number = 0;

  ngOnInit() {
    // Subscribe to cart items changes
    this.subscription.add(
      this.productService.cartItems$.subscribe(items => {
        this.cartItems = items.filter(item => item && item.product);
        this.calculateTotals();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private calculateTotals(): void {
    this.totalAmount = this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }
    
    if (newQuantity > item.product.availableAmount) {
      return; // Can't exceed available amount
    }
    
    // Update the cart item quantity using the service
    this.productService.updateCartItemQuantity(item.product.id, newQuantity);
  }

  removeItem(item: CartItem) {
    // Remove item from cart using the service
    this.productService.removeFromCart(item.product.id);
  }

  clearCart() {
    this.productService.clearCart();
  }
}