import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ProductService } from "../../service/product.service";
import { CartItem } from "../../models/cart";

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: true,
})

export class Cart implements OnInit {  
  cartItems: CartItem[] = [];
  totalAmount = 0;
  totalPrice = 0;
  private readonly productService: ProductService = inject(ProductService);

  ngOnInit() {
     this.cartItems = this.productService.getCartItems();
    this.totalAmount = this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
  }

}