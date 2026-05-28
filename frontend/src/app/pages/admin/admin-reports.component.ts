import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

interface Stats {
  orders: {
    total: number;
    revenue: number;
    pending: number;
    delivered: number;
    cancelled: number;
  };
  users: { total: number };
  products: { total: number; low_stock: number; out_of_stock: number };
  categories: { total: number };
  low_stock_products: { id: number; name_pt: string; stock: number; category_name: string }[];
  recent_orders: { id: number; user_name: string; total: number; status: string; created_at: string }[];
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold dark:text-white">Relatórios e Exportação</h1>
        <p class="text-gray-600 dark:text-gray-400">Métricas e exportação de dados do sistema</p>
      </div>

      @if (loading) {
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-8">
          <div class="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
          A carregar métricas...
        </div>
      } @else if (stats) {

        <!-- Métricas -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p class="text-sm text-gray-500 dark:text-gray-400">Total de Encomendas</p>
            <p class="text-2xl font-bold dark:text-white mt-1">{{ stats.orders.total }}</p>
            <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{{ stats.orders.pending }} pendentes</p>
          </div>
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p class="text-sm text-gray-500 dark:text-gray-400">Receita Total</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">AOA {{ stats.orders.revenue | number:'1.0-0' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ stats.orders.delivered }} entregues</p>
          </div>
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p class="text-sm text-gray-500 dark:text-gray-400">Produtos</p>
            <p class="text-2xl font-bold dark:text-white mt-1">{{ stats.products.total }}</p>
            <p class="text-xs mt-1" [class]="stats.products.low_stock > 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'">
              {{ stats.products.low_stock }} com stock baixo
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p class="text-sm text-gray-500 dark:text-gray-400">Utilizadores</p>
            <p class="text-2xl font-bold dark:text-white mt-1">{{ stats.users.total }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ stats.categories.total }} categorias</p>
          </div>
        </div>

        <!-- Exportação -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 class="text-lg font-semibold dark:text-white mb-4">Exportar Relatório de Encomendas</h2>
          <div class="flex flex-wrap gap-3">
            <a [href]="apiBase + '/admin/reports/export?format=csv&_token=' + token" target="_blank"
               class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              📊 Exportar CSV
            </a>
            <a [href]="apiBase + '/admin/reports/export?format=pdf&_token=' + token" target="_blank"
               class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              📄 Exportar PDF
            </a>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Os ficheiros incluem todas as encomendas com dados do cliente, totais e status.
          </p>
        </div>

        <!-- Produtos com Stock Baixo -->
        @if (stats.low_stock_products.length > 0) {
          <div class="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <h2 class="text-lg font-semibold dark:text-white mb-4 text-red-600 dark:text-red-400">
              ⚠️ Produtos com Stock Baixo (menos de 5 unidades)
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th class="pb-2 pr-4">Produto</th>
                    <th class="pb-2 pr-4">Categoria</th>
                    <th class="pb-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of stats.low_stock_products; track p.id) {
                    <tr class="border-b dark:border-gray-700 last:border-0">
                      <td class="py-2 pr-4 dark:text-white">{{ p.name_pt }}</td>
                      <td class="py-2 pr-4 text-gray-500 dark:text-gray-400">{{ p.category_name }}</td>
                      <td class="py-2">
                        <span [class]="p.stock === 0 ? 'text-red-600 font-bold' : 'text-yellow-600 font-semibold'">
                          {{ p.stock === 0 ? 'Esgotado' : p.stock + ' un.' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      }

      @if (errorMessage) {
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {{ errorMessage }}
        </div>
      }
    </div>
  `,
})
export class AdminReportsComponent implements OnInit {
  private readonly api = inject(ApiService);

  stats: Stats | null = null;
  loading = false;
  errorMessage = '';
  readonly apiBase = '/api';
  token = localStorage.getItem('mini_ecommerce_token') ?? '';

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.api.get<Stats>('/admin/stats').subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar as métricas.';
        this.loading = false;
      },
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmada', shipped: 'Enviada', delivered: 'Entregue', cancelled: 'Cancelada' };
    return m[s] ?? s;
  }
}
