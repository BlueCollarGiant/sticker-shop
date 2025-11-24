import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { ProductDetail } from './components/product-detail/product-detail';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { LoginComponent as DemoLoginComponent } from './components/auth/login/login';
import { LoginComponent } from './components/account/login/login';
import { SignupComponent } from './components/account/signup/signup';
import { DashboardComponent } from './components/account/dashboard/dashboard';
import { AccountSettingsComponent } from './components/account/settings/settings';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },

  // Demo mode login (simple demo login)
  { path: 'login', component: DemoLoginComponent },

  // Account routes (existing full account system)
  { path: 'account/login', component: LoginComponent },
  { path: 'account/signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'settings', component: AccountSettingsComponent, canActivate: [authGuard] },

  // Admin routes
  { path: 'admin', component: AdminPanelComponent, canActivate: [adminGuard] }
];
