import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { ProductItem, ProductService } from '../../core/services/product.service';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    PropertyCardComponent,
    RouterLink,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);

  featuredProducts: ProductItem[] = [];
  loading = false;

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }


  ngOnInit(): void {
    this.loading = true;
    this.productService.list().subscribe({
      next: (collection) => {
        this.featuredProducts = collection.items.slice(0, 6);
        this.loading = false;
      },
      error: () => {
        this.featuredProducts = [];
        this.loading = false;
      },
    });
  }

  t(key: string): string {
    return this.languageService.t(key);
  }

  isPromotion(product: ProductItem): boolean {
    return product.id % 3 === 0;
  }
}
