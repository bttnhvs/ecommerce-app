import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ProductStore } from "../../service/product-store.service";

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: true,
})

export class Cart implements OnInit {  
  cartItems: any[] = [];
  totalAmount = 0;
  totalPrice = 0;
  private readonly productStore: ProductStore = inject(ProductStore);

  ngOnInit() {
     this.cartItems = this.productStore.getCartItems();
    this.totalAmount = this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
  }

}