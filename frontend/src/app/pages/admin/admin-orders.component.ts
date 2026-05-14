import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold dark:text-white">Gestão de Encomendas</h1>
        <p class="text-gray-600 dark:text-gray-400">Gerir todas as encomendas do sistema</p>
      </div>

      <!-- Status Filter -->
      <div class="mb-6 flex gap-2">
        <select [(ngModel)]="filterStatus" (change)="applyFilters()" 
                class="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Paga</option>
          <option value="shipped">Enviada</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      @if (isLoading) {
        <div class="text-center py-8 text-gray-500">A carregar...</div>
      } @else if (orders.length === 0) {
        <div class="text-center py-8 text-gray-500">Nenhuma encomenda encontrada</div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border dark:border-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th class="border p-3 text-left dark:border-gray-700">ID</th>
                <th class="border p-3 text-left dark:border-gray-700">Cliente</th>
                <th class="border p-3 text-left dark:border-gray-700">Pagamento</th>
                <th class="border p-3 text-left dark:border-gray-700">Total</th>
                <th class="border p-3 text-left dark:border-gray-700">Status</th>
                <th class="border p-3 text-left dark:border-gray-700">Data</th>
                <th class="border p-3 text-center dark:border-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders; track order.id) {
                <tr [class]="'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ' + (order.status === 'pending' ? 'bg-yellow-50/50' : '')">

                  <td class="border p-3 dark:border-gray-700 font-bold">#{{ order.id }}</td>
                  <td class="border p-3 dark:border-gray-700">
                    <div>{{ order.user_name }}</div>
                    <div class="text-[10px] text-gray-500">{{ order.user_email }}</div>
                  </td>
                  <td class="border p-3 dark:border-gray-700">
                    <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-medium">{{ order.payment_method | uppercase }}</span>
                  </td>
                  <td class="border p-3 dark:border-gray-700 font-bold text-primary">AOA {{ order.total | number }}</td>
                  <td class="border p-3 dark:border-gray-700">
                    <select [(ngModel)]="order.status" (change)="updateStatus(order)"
                            [class]="statusColor(order.status)"
                            class="px-2 py-1 text-xs font-bold border rounded-lg dark:bg-gray-700 outline-none">
                      <option value="pending">PENDENTE</option>
                      <option value="paid">PAGA</option>
                      <option value="processing">PROCESSANDO</option>
                      <option value="shipped">ENVIADA</option>
                      <option value="delivered">ENTREGUE</option>
                      <option value="cancelled">CANCELADA</option>
                    </select>
                  </td>
                  <td class="border p-3 dark:border-gray-700 text-xs">{{ formatDate(order.created_at) }}</td>
                  <td class="border p-3 text-center dark:border-gray-700">
                    <button (click)="viewDetails(order)" class="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>

          </table>
        </div>
      }

      @if (errorMessage) {
        <div class="mt-4 p-4 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
          {{ errorMessage }}
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private readonly api = inject(ApiService);

  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  filterStatus = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading = true;
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
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar encomendas';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    if (!this.filterStatus) {
      this.loadOrders();
    } else {
      this.orders = this.orders.filter((o) => o.status === this.filterStatus);
    }
  }

  updateStatus(order: Order): void {
    this.api.put<void>(`/orders/${order.id}/status`, { status: order.status }).subscribe({
      next: () => {
        // Status updated
      },
      error: () => {
        this.errorMessage = 'Erro ao atualizar status da encomenda';
      },
    });
  }

  statusColor(s: string): string {
    const m: any = {
      pending: 'border-yellow-400 text-yellow-600',
      paid: 'border-blue-400 text-blue-600',
      processing: 'border-indigo-400 text-indigo-600',
      shipped: 'border-purple-400 text-purple-600',
      delivered: 'border-green-400 text-green-600',
      cancelled: 'border-red-400 text-red-600'
    };
    return m[s] || 'border-gray-300';
  }

  viewDetails(order: Order): void {
    alert(`Encomenda #${order.id}\nCliente: ${order.user_name}\nPagamento: ${order.payment_method.toUpperCase()}\nTotal: AOA ${order.total}\nStatus: ${order.status.toUpperCase()}`);
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  }
}
