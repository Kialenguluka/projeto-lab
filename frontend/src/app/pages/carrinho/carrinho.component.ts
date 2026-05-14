import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart.service';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';
import { CheckoutModalComponent } from '../../components/checkout-modal/checkout-modal.component';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, CheckoutModalComponent],
  templateUrl: './carrinho.component.html',
})
export class CarrinhoComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  cartItems: CartItem[] = [];
  apiTotal = 0;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showCheckoutModal = false;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItems = cart.items;
        this.apiTotal = cart.total;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Inicie sessao para ver o seu carrinho.';
        this.loading = false;
      },
    });
  }

  updateQuantity(item: CartItem, delta: number): void {
    const nextQuantity = Math.max(0, item.quantity + delta);
    this.cartService.updateItem(item.id, nextQuantity).subscribe({
      next: (cart) => this.applyCart(cart.items, cart.total),
      error: () => {
        this.errorMessage = 'Nao foi possivel atualizar o carrinho.';
      },
    });
  }

  removeItem(id: number): void {
    this.cartService.removeItem(id).subscribe({
      next: (cart) => this.applyCart(cart.items, cart.total),
      error: () => {
        this.errorMessage = 'Nao foi possivel remover o produto.';
      },
    });
  }

  openCheckout(): void {
    if (this.cartItems.length === 0) {
      this.errorMessage = 'Carrinho vazio';
      return;
    }
    this.showCheckoutModal = true;
  }

  onCheckoutConfirmed(result: any): void {
    const { addressId, paymentMethod } = result;
    this.showCheckoutModal = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.cartService.checkout(addressId, paymentMethod).subscribe({
      next: (order) => {
        this.cartItems = [];
        this.apiTotal = 0;
        void this.router.navigate(['/checkout/sucesso'], { queryParams: { orderId: order.orderId } });
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel finalizar a compra.';
      },
    });
  }


  onCheckoutCancelled(): void {
    this.showCheckoutModal = false;
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get taxes(): number {
    return this.subtotal * 0.14;
  }

  get total(): number {
    return this.subtotal + this.taxes;
  }

  itemName(item: CartItem): string {
    return item.name_pt || item.name_en;
  }

  itemImage(item: CartItem): string {
    return item.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop';
  }

  private applyCart(items: CartItem[], total: number): void {
    this.cartItems = items;
    this.apiTotal = total;
    this.errorMessage = '';
  }
}
