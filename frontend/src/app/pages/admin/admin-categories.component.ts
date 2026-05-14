import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface Category {
  id: number;
  name_pt: string;
  name_en: string;
  slug: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold dark:text-white">Gestão de Categorias</h1>
          <p class="text-gray-600 dark:text-gray-400">Criar, editar e remover categorias</p>
        </div>
        <button (click)="openNew()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Nova Categoria
        </button>
      </div>

      @if (isLoading) {
        <div class="text-center py-8 text-gray-500">A carregar...</div>
      } @else if (categories.length === 0) {
        <div class="text-center py-8 text-gray-500">Nenhuma categoria encontrada</div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (cat of categories; track cat.id) {
            <div class="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-bold dark:text-white">{{ cat.name_pt }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ cat.name_en }}</p>
                </div>
                <span class="text-xs px-2 py-1 rounded" [ngClass]="cat.active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'">
                  {{ cat.active ? 'Ativa' : 'Inativa' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ cat.slug }}</p>
              <div class="flex gap-2">
                <button (click)="edit(cat)" class="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Editar
                </button>
                <button (click)="deleteCategory(cat)" class="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal -->
      @if (isDialogOpen) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <h2 class="text-xl font-bold mb-4 dark:text-white">
                {{ editingId ? 'Editar' : 'Nova' }} Categoria
              </h2>
              <div class="space-y-3">
                <input
                  type="text"
                  [(ngModel)]="form.namePt"
                  placeholder="Nome (Português)"
                  class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  [(ngModel)]="form.nameEn"
                  placeholder="Nome (Inglês)"
                  class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  [(ngModel)]="form.slug"
                  placeholder="Slug (slug-da-categoria)"
                  class="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <label class="flex items-center">
                  <input type="checkbox" [(ngModel)]="form.active" class="mr-2" />
                  <span class="dark:text-white">Ativa</span>
                </label>
              </div>
              <div class="flex gap-2 mt-6">
                <button (click)="closeDialog()" class="flex-1 px-3 py-2 border rounded hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white">
                  Cancelar
                </button>
                <button (click)="save()" class="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {{ editingId ? 'Atualizar' : 'Criar' }}
                </button>
              </div>
            </div>
          </div>
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
export class AdminCategoriesComponent implements OnInit {
  private readonly api = inject(ApiService);

  categories: Category[] = [];
  isLoading = false;
  isDialogOpen = false;
  editingId: number | null = null;
  errorMessage = '';

  form = { namePt: '', nameEn: '', slug: '', active: true };

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.get<any>('/admin/categories').subscribe({
      next: (response) => {
        // Backend returns { items: [...] }
        const items = response.data?.items || response.data || [];
        this.categories = Array.isArray(items) ? items : [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar categorias';
        this.isLoading = false;
      },
    });
  }

  openNew(): void {
    this.editingId = null;
    this.form = { namePt: '', nameEn: '', slug: '', active: true };
    this.isDialogOpen = true;
  }

  edit(cat: Category): void {
    this.editingId = cat.id;
    this.form = { 
      namePt: cat.name_pt,
      nameEn: cat.name_en,
      slug: cat.slug,
      active: cat.active 
    };
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.editingId = null;
  }

  save(): void {
    if (!this.form.namePt || !this.form.nameEn || !this.form.slug) {
      this.errorMessage = 'Todos os campos são obrigatórios';
      return;
    }

    if (this.editingId) {
      this.api.put<any>(`/admin/categories/${this.editingId}`, this.form).subscribe({
        next: () => {
          this.loadCategories();
          this.closeDialog();
        },
        error: () => {
          this.errorMessage = 'Erro ao atualizar categoria';
        },
      });
    } else {
      this.api.post<any>('/admin/categories', this.form).subscribe({
        next: () => {
          this.loadCategories();
          this.closeDialog();
        },
        error: () => {
          this.errorMessage = 'Erro ao criar categoria';
        },
      });
    }
  }

  deleteCategory(cat: Category): void {
    if (confirm(`Tem a certeza que deseja eliminar ${cat.name_pt}?`)) {
      this.api.delete<void>(`/admin/categories/${cat.id}`).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: () => {
          this.errorMessage = 'Erro ao eliminar categoria';
        },
      });
    }
  }
}
