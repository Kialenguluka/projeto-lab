import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryItem, CategoryService } from '../../core/services/category.service';
import { ProductItem, ProductService, ProductCollection } from '../../core/services/product.service';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    PropertyCardComponent,
  ],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);

  categories: CategoryItem[] = [];
  products: ProductItem[] = [];
  
  // Filtering
  searchQuery = '';
  priceMin = 0;
  priceMax = 500000;
  selectedCategories: string[] = [];
  sortBy = 'recommended';
  showOnlyAvailable = false;
  promotionsOnly = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 1;

  mobileFiltersOpen = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('search') ?? this.searchQuery;
      const category = params.get('category');
      this.selectedCategories = category ? [category] : this.selectedCategories;
      // When route params change, reset to page 1 and reload
      this.currentPage = 1;
      this.loadProducts();
    });
    this.promotionsOnly = this.route.snapshot.routeConfig?.path === 'promocoes';
    this.loadCategories();
  }

  // The server handles category/search filtering if we pass them, but here we
  // combine local filtering for price/stock with server pagination to keep it simple,
  // or we just fetch everything and paginate locally. 
  // Given the current implementation, we fetch paginated from server. 
  // Local filtering (price, stock) might break strict server pagination totals,
  // but we'll apply them locally over the fetched page as an MVP approach, 
  // or better: just let server do basic filtering and skip complex price filtering for now, 
  // but to satisfy both: let's filter locally the results we get from the server.
  
  get filteredProducts(): ProductItem[] {
    const q = this.searchQuery.toLowerCase();
    return this.products.filter((product) => {
      const matchesSearch =
        !q ||
        this.productName(product).toLowerCase().includes(q) ||
        this.productDescription(product).toLowerCase().includes(q);
      const matchesPrice = product.price >= this.priceMin && product.price <= this.priceMax;
      const matchesCategory =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(product.category_slug || '');
      const matchesStock = !this.showOnlyAvailable || product.stock > 0;
      const matchesPromotion = !this.promotionsOnly || this.isPromotion(product);
      return matchesSearch && matchesPrice && matchesCategory && matchesStock && matchesPromotion;
    });
  }

  get sortedProducts(): ProductItem[] {
    const list = [...this.filteredProducts];
    switch (this.sortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      case 'stock':
        return list.sort((a, b) => b.stock - a.stock);
      default:
        return list;
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    // Passing search and category to server to let it handle primary DB filtering
    const primaryCategory = this.selectedCategories.length === 1 ? this.selectedCategories[0] : '';
    
    this.productService.list(this.searchQuery, primaryCategory, this.currentPage, this.pageSize).subscribe({
      next: (collection: ProductCollection) => {
        this.products = collection.items;
        this.totalItems = collection.total;
        this.totalPages = collection.totalPages;
        this.currentPage = collection.page;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel carregar os produtos. Confirme se a API esta ligada.';
        this.loading = false;
      },
    });
  }

  loadCategories(): void {
    this.categoryService.list().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  toggleCategory(categoryId: string): void {
    if (this.selectedCategories.includes(categoryId)) {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== categoryId);
    } else {
      this.selectedCategories = [...this.selectedCategories, categoryId];
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  isCategoryChecked(id: string): boolean {
    return this.selectedCategories.includes(id);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
    if (this.mobileFiltersOpen) {
      this.closeMobileFilters();
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get pagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  closeMobileFilters(): void {
    this.mobileFiltersOpen = false;
  }

  productName(product: ProductItem): string {
    return product.name_pt || product.name_en;
  }

  productDescription(product: ProductItem): string {
    return product.description_pt || product.description_en || '';
  }

  isPromotion(product: ProductItem): boolean {
    return product.id % 3 === 0;
  }
}
