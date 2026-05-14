import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminProdutosComponent } from './pages/admin/admin-produtos.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders.component';
import { AdminUsersComponent } from './pages/admin/admin-users.component';
import { AdminCategoriesComponent } from './pages/admin/admin-categories.component';
import { AdminReportsComponent } from './pages/admin/admin-reports.component';
import { AuthForgotPasswordComponent } from './pages/auth/auth-forgot-password.component';
import { AuthLoginComponent } from './pages/auth/auth-login.component';
import { AuthRegisterComponent } from './pages/auth/auth-register.component';
import { CarrinhoComponent } from './pages/carrinho/carrinho.component';
import { CheckoutSuccessComponent } from './pages/checkout-success/checkout-success.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { EncomendaDetailComponent } from './pages/encomendas/encomenda-detail.component';
import { EncomendasComponent } from './pages/encomendas/encomendas.component';
import { HomeComponent } from './pages/home/home.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { PropriedadeDetailComponent } from './pages/propriedade/propriedade-detail.component';
import { StubPageComponent } from './pages/stub/stub-page.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'promocoes', component: CatalogoComponent },
  { path: 'carrinho', component: CarrinhoComponent, canActivate: [authGuard] },
  { path: 'auth/login', component: AuthLoginComponent },
  { path: 'auth/register', component: AuthRegisterComponent },
  { path: 'auth/forgot-password', component: AuthForgotPasswordComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'encomendas', component: EncomendasComponent, canActivate: [authGuard] },
  { path: 'encomendas/:id', component: EncomendaDetailComponent, canActivate: [authGuard] },
  { path: 'produto/:id', component: PropriedadeDetailComponent },
  { path: 'propriedade/:id', redirectTo: 'produto/:id' },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/produtos', component: AdminProdutosComponent, canActivate: [adminGuard] },
  { path: 'admin/categorias', component: AdminCategoriesComponent, canActivate: [adminGuard] },
  { path: 'admin/encomendas', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'checkout/sucesso', component: CheckoutSuccessComponent, canActivate: [authGuard] },
  { path: 'admin/utilizadores', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/relatorios', component: AdminReportsComponent, canActivate: [adminGuard] },
  { path: 'admin/configuracoes', component: StubPageComponent, canActivate: [adminGuard] },
  { path: 'categoria/:slug', component: StubPageComponent },
  { path: 'novidades', component: StubPageComponent },
  { path: 'mais-vendidos', component: StubPageComponent },
  { path: 'termos', component: StubPageComponent },
  { path: 'privacidade', component: StubPageComponent },
  { path: '**', redirectTo: '' },
];
