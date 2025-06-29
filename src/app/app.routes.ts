import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Products } from './pages/products/products.component';
import { Cart } from './pages/cart/cart.component';

export const routes: Routes = [
  { path: 'products', component: Products},
  { path: 'cart', component: Cart },
  { path: '**', redirectTo: 'products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
