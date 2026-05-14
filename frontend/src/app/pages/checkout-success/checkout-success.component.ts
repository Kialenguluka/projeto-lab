import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
      <div class="text-center max-w-md">
        <!-- Success Icon -->
        <div class="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <h1 class="text-3xl font-bold dark:text-white mb-3">Compra Confirmada!</h1>
        <p class="text-gray-500 dark:text-gray-400 mb-2">
          A sua encomenda foi criada com sucesso.
        </p>
        @if (orderId) {
          <p class="text-lg font-semibold text-primary mb-8">
            Encomenda #{{ orderId }}
          </p>
        }

        <div class="space-y-3">
          @if (orderId) {
            <a
              [routerLink]="['/encomendas', orderId]"
              class="block w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
              Ver Encomenda
            </a>
          }
          <a
            routerLink="/encomendas"
            class="block w-full py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Histórico de Encomendas
          </a>
          <a
            routerLink="/catalogo"
            class="block w-full py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors">
            Continuar a Comprar
          </a>
        </div>
      </div>
    </main>
    <app-footer />
  `,
})
export class CheckoutSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  orderId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('orderId');
    this.orderId = id ? Number(id) : null;
  }
}
