import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-produtos.component.html',
})
export class AdminProdutosComponent implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly api = inject(ApiService);

  categories: any[] = [];
  products: any[] = [];
  searchQuery = '';
  isDialogOpen = false;
  editingId: number | null = null;
  actionsOpenId: number | null = null;
  isLoading = false;

  form = {
    namePt: '',
    nameEn: '',
    categoryId: '',
    price: '',
    stock: '',
    active: 1,
    descriptionPt: '',
    descriptionEn: '',
    imageUrl: '',
  };

  @HostListener('document:click', ['$event'])
  onDoc(ev: MouseEvent): void {
    if (!this.host.nativeElement.contains(ev.target as Node)) {
      this.actionsOpenId = null;
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.api.get<any>('/categories').subscribe({
      next: (res) => {
        const items = res.data?.items || res.data || [];
        this.categories = Array.isArray(items) ? items : [];
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.api.get<any>('/admin/products?limit=100').subscribe({
      next: (res) => {
        const items = res.data?.items || res.data || [];
        this.products = Array.isArray(items) ? items : [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredProducts(): any[] {
    const q = this.searchQuery.toLowerCase();
    return this.products.filter((p) => p.name_pt.toLowerCase().includes(q));
  }

  toggleActions(ev: MouseEvent, id: number): void {
    ev.stopPropagation();
    this.actionsOpenId = this.actionsOpenId === id ? null : id;
  }

  openNew(): void {
    this.editingId = null;
    this.form = {
      namePt: '',
      nameEn: '',
      categoryId: '',
      price: '',
      stock: '',
      active: 1,
      descriptionPt: '',
      descriptionEn: '',
      imageUrl: '',
    };
    this.isDialogOpen = true;
  }

  edit(p: any, ev?: MouseEvent): void {
    ev?.stopPropagation();
    this.actionsOpenId = null;
    this.editingId = p.id;
    this.form = {
      namePt: p.name_pt,
      nameEn: p.name_en,
      categoryId: p.category_id,
      price: p.price,
      stock: p.stock,
      active: p.active,
      descriptionPt: p.description_pt,
      descriptionEn: p.description_en,
      imageUrl: p.image_url,
    };
    this.isDialogOpen = true;
  }

  deleteProduct(id: number, ev?: MouseEvent): void {
    ev?.stopPropagation();
    this.actionsOpenId = null;
    if (confirm('Tem a certeza que deseja eliminar este produto?')) {
      this.api.delete<void>(`/admin/products/${id}`).subscribe({
        next: () => {
          this.loadProducts();
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.isLoading = true;
      this.api.post<any>('/upload', formData).subscribe({
        next: (res) => {
          this.form.imageUrl = res.data.url;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isLoading = false;
          alert('Erro ao carregar imagem. Verifique o formato e tamanho (máx 5MB).');
        }
      });
    }
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.editingId = null;
  }

  save(): void {
    const payload = {
      categoryId: Number(this.form.categoryId),
      namePt: this.form.namePt,
      nameEn: this.form.nameEn || this.form.namePt, // fallback
      descriptionPt: this.form.descriptionPt,
      descriptionEn: this.form.descriptionEn || this.form.descriptionPt,
      price: Number(this.form.price),
      stock: Number(this.form.stock),
      imageUrl: this.form.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
      active: Number(this.form.active),
    };

    if (this.editingId) {
      this.api.put<any>(`/admin/products/${this.editingId}`, payload).subscribe({
        next: () => {
          this.loadProducts();
          this.closeDialog();
        }
      });
    } else {
      this.api.post<any>('/admin/products', payload).subscribe({
        next: () => {
          this.loadProducts();
          this.closeDialog();
        }
      });
    }
  }
}
