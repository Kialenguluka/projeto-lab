import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductItem, ProductService } from '../../core/services/product.service';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-propriedade-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './propriedade-detail.component.html',
})
export class PropriedadeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly languageService = inject(LanguageService);

  product: ProductItem | null = null;
  quantity = 1;
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!productId) {
      this.errorMessage = this.t('productUnavailable');
      return;
    }

    this.loading = true;
    this.productService.show(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.t('catalogError');
        this.loading = false;
      },
    });
  }

  get name(): string {
    return this.product ? this.languageService.text(this.product.name_pt, this.product.name_en) : '';
  }

  get description(): string {
    return this.product ? this.languageService.text(this.product.description_pt, this.product.description_en) : '';
  }

  get image(): string {
    return this.product?.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop';
  }

  get totalPrice(): number {
    return (this.product?.price ?? 0) * this.quantity;
  }

  adjustQuantity(delta: number): void {
    if (!this.product) {
      return;
    }
    this.quantity = Math.min(this.product.stock, Math.max(1, this.quantity + delta));
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.cartService.addItem(this.product.id, this.quantity).subscribe({
      next: () => {
        this.successMessage = this.t('cartAddSuccess');
      },
      error: () => {
        this.errorMessage = this.t('cartAddLoginRequired');
      },
    });
  }

  t(key: string): string {
    return this.languageService.t(key);
  }
}
