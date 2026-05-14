import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  created_at: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold dark:text-white">Gestão de Utilizadores</h1>
        <p class="text-gray-600 dark:text-gray-400">Gerir utilizadores e permissões</p>
      </div>

      @if (isLoading) {
        <div class="text-center py-8 text-gray-500">A carregar...</div>
      } @else if (users.length === 0) {
        <div class="text-center py-8 text-gray-500">Nenhum utilizador encontrado</div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border dark:border-gray-700">
            <thead class="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th class="border p-3 text-left dark:border-gray-700">ID</th>
                <th class="border p-3 text-left dark:border-gray-700">Nome</th>
                <th class="border p-3 text-left dark:border-gray-700">Email</th>
                <th class="border p-3 text-left dark:border-gray-700">Role</th>
                <th class="border p-3 text-left dark:border-gray-700">Membro Desde</th>
                <th class="border p-3 text-center dark:border-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="border p-3 dark:border-gray-700">{{ user.id }}</td>
                  <td class="border p-3 dark:border-gray-700">{{ user.name }}</td>
                  <td class="border p-3 dark:border-gray-700">{{ user.email }}</td>
                  <td class="border p-3 dark:border-gray-700">
                    <select [(ngModel)]="user.role" (change)="updateRole(user)"
                            class="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <option value="customer">Cliente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td class="border p-3 dark:border-gray-700">{{ formatDate(user.created_at) }}</td>
                  <td class="border p-3 text-center dark:border-gray-700">
                    <button (click)="deleteUser(user)" class="text-red-600 hover:underline text-sm">Eliminar</button>
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
export class AdminUsersComponent implements OnInit {
  private readonly api = inject(ApiService);

  users: User[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.get<User[]>('/users').subscribe({
      next: (response) => {
        this.users = Array.isArray(response.data) ? response.data : [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar utilizadores';
        this.isLoading = false;
      },
    });
  }

  updateRole(user: User): void {
    this.api.put<User>(`/users/${user.id}`, { role: user.role }).subscribe({
      next: () => {
        // Role updated
      },
      error: () => {
        this.errorMessage = 'Erro ao atualizar papel do utilizador';
      },
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Tem a certeza que deseja eliminar o utilizador ${user.name}?`)) {
      this.api.delete<void>(`/users/${user.id}`).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.id !== user.id);
        },
        error: () => {
          this.errorMessage = 'Erro ao eliminar utilizador';
        },
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  }
}
