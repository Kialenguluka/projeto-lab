import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';
import { LanguageService } from '../../core/services/language.service';

interface OrderItem {
  product_id: number;
  name_pt: string;
  name_en: string;
  quantity: number;
  unit_price: number;
}

interface OrderDetail {
  id: number;
  user_name: string;
  user_email: string;
  total: number;
  status: string;
  payment_method: string;
  notes: string | null;
  address_id: number | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-encomenda-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="container mx-auto px-4 py-8 min-h-screen">
      <a routerLink="/encomendas" class="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
        {{ t('backToOrders') }}
      </a>

      @if (loading) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      } @else if (errorMessage) {
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {{ errorMessage }}
        </div>
      } @else if (order) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Detalhes da Encomenda -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Header da encomenda -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 class="text-2xl font-bold dark:text-white">{{ t('orderNumber') }}{{ order.id }}</h1>
                  <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {{ t('createdOn') }} {{ formatDate(order.created_at) }}
                  </p>
                </div>
                <span [class]="statusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-semibold">
                  {{ statusLabel(order.status) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-500 dark:text-gray-400">{{ t('paymentMethodLabel') }}</p>
                  <p class="font-medium dark:text-white">{{ paymentLabel(order.payment_method) }}</p>
                </div>
                @if (order.notes) {
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">{{ t('notesLabel') }}</p>
                    <p class="font-medium dark:text-white">{{ order.notes }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Itens da Encomenda -->
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 class="text-lg font-semibold dark:text-white mb-4">{{ t('orderItemsTitle') }}</h2>
              <div class="divide-y divide-gray-100 dark:divide-gray-700">
                @for (item of order.items; track item.product_id) {
                  <div class="py-4 flex items-center justify-between">
                    <div>
                      <p class="font-medium dark:text-white">{{ itemName(item) }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('quantity') }}: {{ item.quantity }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium dark:text-white">AOA {{ item.unit_price | number:'1.2-2' }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('subtotal') }}: AOA {{ (item.unit_price * item.quantity) | number:'1.2-2' }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Resumo -->
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 class="text-lg font-semibold dark:text-white mb-4">{{ t('summaryTitle') }}</h2>
              <div class="space-y-3 text-sm">
                @for (item of order.items; track item.product_id) {
                  <div class="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{{ itemName(item) }} x {{ item.quantity }}</span>
                    <span>AOA {{ (item.unit_price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
                <hr class="border-gray-200 dark:border-gray-700">
                <div class="flex justify-between font-bold text-lg dark:text-white">
                  <span>{{ t('totalLabel') }}</span>
                  <span>AOA {{ order.total | number:'1.2-2' }}</span>
                </div>
              </div>
              <button (click)="exportPdf()" class="w-full mt-6 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                {{ t('exportPdfButton') }}
              </button>
            </div>
          </div>
        </div>
      }
    </main>
    <app-footer />
  `,
})
export class EncomendaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly exportService = inject(ExportService);
  private readonly languageService = inject(LanguageService);

  order: OrderDetail | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(Number(id));
  }

  private loadOrder(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.get<{ order: OrderDetail }>(`/orders/${id}`).subscribe({
      next: (response) => {
        this.order = response.data?.order ?? null;
        if (!this.order) this.errorMessage = 'Encomenda não encontrada.';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar a encomenda.';
        this.loading = false;
      },
    });
  }

  exportPdf(): void {
    if (!this.order) return;
    const token = localStorage.getItem('mini_ecommerce_token');
    const url = `/api/orders/${this.order.id}/export?token=${token}`;
    window.open(url, '_blank');
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: this.t('pendingOrdersLabel'),
      paid: this.t('confirmedOrdersLabel'),
      shipped: this.t('statusShipped'),
      delivered: this.t('deliveredOrdersLabel'),
      cancelled: this.t('cancelledOrdersLabel'),
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      paid:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return m[s] ?? 'bg-gray-100 text-gray-800';
  }

  paymentLabel(p: string): string {
    const labels: Record<string, string> = { cash: this.t('paymentCash'), transfer: this.t('paymentTransfer'), card: this.t('paymentCard') };
    return labels[p] ?? p;

    const m: Record<string, string> = { cash: 'Numerário', transfer: 'Transferência', card: 'Cartão' };
    return m[p] ?? p;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(this.languageService.locale(), { year: 'numeric', month: 'long', day: 'numeric' });

    return new Date(d).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  itemName(item: OrderItem): string {
    return this.languageService.text(item.name_pt, item.name_en);
  }

  t(key: string): string {
    return this.languageService.t(key);
  }
}
