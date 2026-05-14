import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  product_id: number;
  name_pt: string;
  name_en: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

@Component({
  selector: 'app-encomendas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="container mx-auto px-4 py-8 min-h-screen">
      <div class="mb-8">
        <h1 class="text-3xl font-bold dark:text-white">As Minhas Encomendas</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Histórico de todas as suas compras</p>
      </div>

      <!-- Status Filter -->
      <div class="mb-6 flex flex-wrap gap-2">
        @for (s of statusOptions; track s.value) {
          <button
            (click)="statusFilter = s.value"
            [class]="statusFilter === s.value
              ? 'px-4 py-2 rounded-full text-sm font-medium bg-primary text-white'
              : 'px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
          >{{ s.label }}</button>
        }
      </div>

      @if (loading) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      } @else if (errorMessage) {
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {{ errorMessage }}
        </div>
      } @else if (filteredOrders.length === 0) {
        <div class="text-center py-16">
          <div class="text-6xl mb-4">📦</div>
          <h2 class="text-xl font-semibold dark:text-white mb-2">Nenhuma encomenda encontrada</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Faça a sua primeira compra no nosso catálogo.</p>
          <a routerLink="/catalogo" class="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
            Ver Produtos
          </a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of filteredOrders; track order.id) {
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
              <!-- Status Banner for Pending -->
              @if (order.status === 'pending') {
                <div class="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-2 border-b border-yellow-100 dark:border-yellow-900/30 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <p class="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Aguardando confirmação de pagamento ({{ paymentLabel(order.payment_method) }})</p>
                </div>
              }

              <div class="p-6">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <span class="font-bold text-lg dark:text-white">#{{ order.id }}</span>
                      <span [class]="statusClass(order.status)" class="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {{ statusLabel(order.status) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(order.created_at) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-black text-primary">AOA {{ order.total | number:'1.2-2' }}</p>
                    <div class="flex gap-2 mt-4 justify-end">
                      <a [routerLink]="['/encomendas', order.id]"
                         class="px-5 py-2 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-all">
                        Detalhes
                      </a>
                      <button (click)="exportPdf(order)"
                              class="px-5 py-2 text-xs font-bold bg-neutral-900 dark:bg-white dark:text-black text-white rounded-xl hover:scale-105 transition-all">
                        📄 Fatura
                      </button>
                      @if (order.status === 'pending') {
                        <button (click)="cancelOrder(order)"
                                class="px-5 py-2 text-xs font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all">
                          Cancelar
                        </button>
                      }
                    </div>
                  </div>

                </div>
              </div>
            </div>
          }

        </div>
      }
    </main>
    <app-footer />
  `,
})
export class EncomendasComponent implements OnInit {
  private readonly api = inject(ApiService);

  orders: Order[] = [];
  loading = false;
  errorMessage = '';
  statusFilter = 'all';

  readonly statusOptions = [
    { value: 'all',       label: 'Todos' },
    { value: 'pending',   label: 'Pendente' },
    { value: 'paid',      label: 'Paga' },
    { value: 'shipped',   label: 'Enviada' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.get<Order[]>('/orders').subscribe({
      next: (response) => {
        const rawData = response.data as any;
        if (Array.isArray(rawData)) {
          this.orders = rawData;
        } else if (rawData && Array.isArray(rawData.orders)) {
          this.orders = rawData.orders;
        } else {
          this.orders = [];
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar as encomendas. Verifique se está autenticado.';
        this.loading = false;
      },
    });
  }

  get filteredOrders(): Order[] {
    if (this.statusFilter === 'all') return this.orders;
    return this.orders.filter((o) => o.status === this.statusFilter);
  }

  cancelOrder(order: Order): void {
    if (!confirm('Tem a certeza que deseja cancelar esta encomenda?')) return;
    this.api.put<void>(`/orders/${order.id}/status`, { status: 'cancelled' }).subscribe({
      next: () => {
        order.status = 'cancelled';
      },
      error: () => {
        alert('Erro ao cancelar a encomenda.');
      },
    });
  }

  exportPdf(order: Order): void {
    const token = localStorage.getItem('mini_ecommerce_token');
    const url = `http://localhost:8000/api/orders/${order.id}/export?token=${token}`;
    window.open(url, '_blank');
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending:    'Pendente',
      paid:       'Paga',
      processing: 'Em Processamento',
      shipped:    'Enviada',
      delivered:  'Entregue',
      cancelled:  'Cancelada',
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      paid:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return m[s] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  }

  paymentLabel(p: string): string {
    const m: Record<string, string> = {
      cash: 'Numerário',
      transfer: 'Transferência',
      card: 'Cartão',
    };
    return m[p] ?? p;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
