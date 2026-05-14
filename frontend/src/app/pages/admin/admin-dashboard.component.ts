import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface Stats {
  orders: { total: number; revenue: number; pending: number; delivered: number; cancelled: number };
  users: { total: number };
  products: { total: number; low_stock: number; out_of_stock: number };
  categories: { total: number };
  low_stock_products: { id: number; name_pt: string; stock: number }[];
  recent_orders: { id: number; user_name: string; user_email: string; total: number; status: string; created_at: string }[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  stats: Stats | null = null;
  loading = false;

  readonly quickActions = [
    { label: 'Gerir Produtos', href: '/admin/produtos', icon: '📦' },
    { label: 'Gerir Categorias', href: '/admin/categorias', icon: '🏷️' },
    { label: 'Ver Encomendas', href: '/admin/encomendas', icon: '🛒' },
    { label: 'Gerir Utilizadores', href: '/admin/utilizadores', icon: '👥' },
    { label: 'Relatórios', href: '/admin/relatorios', icon: '📊' },
  ];

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
        this.loading = false;
      },
    });
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      paid:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      shipped:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return m[s] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Paga',
      shipped: 'Enviada',
      delivered: 'Entregue',
      cancelled: 'Cancelada',
    };
    return m[s] ?? s;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-PT');
  }
}
