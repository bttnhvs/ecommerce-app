import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CartStore } from "../../store/cart.store";
import { CartItem } from "../../store/cart.store";

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: true,
})

export class Cart {
  private readonly cartStore = inject(CartStore);
  readonly cartItems = this.cartStore.items;
  readonly totalQuantity = this.cartStore.totalQuantity;
  readonly totalPrice = this.cartStore.totalPrice;

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    if (newQuantity > item.product.availableAmount) {
      return; // Can't exceed the available amount
    }

    // Update the cart item quantity using the store
    this.cartStore.updateQuantity(item.product.id, newQuantity);
  }

  removeItem(item: CartItem) {
    // Remove item from the cart using the store
    this.cartStore.removeFromCart(item.product.id);
  }

  clearCart() {
    this.cartStore.clearCart();
  }
}
