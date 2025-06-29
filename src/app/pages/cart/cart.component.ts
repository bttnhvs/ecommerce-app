import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, computed } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ProductService } from "../../service/product.service";
import { CartItem } from "../../models/cart";

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: true,
})

export class Cart implements OnInit {  
  private readonly productService: ProductService = inject(ProductService);
  
  // Make cart items reactive and filter out undefined items
  cartItems = computed(() => 
    this.productService.cartItems().filter(item => item && item.product)
  );
  
  // Compute totals reactively
  totalAmount = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );
  
  totalPrice = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.quantity * item.product.price), 0)
  );

  ngOnInit() {
    // No need to manually load cart items anymore as they're reactive
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