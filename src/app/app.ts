import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RootStore } from './store/root.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  protected title = 'ecommerce-app';
  
  private readonly rootStore = inject(RootStore);

  // Use computed properties from the root store
  protected cartItemCount = this.rootStore.cartItemCount;
  protected isLoading = this.rootStore.isLoading;
  protected hasError = this.rootStore.hasError;
  protected errorMessage = this.rootStore.errorMessage;
  protected isCartEmpty = this.rootStore.isCartEmpty;
}
