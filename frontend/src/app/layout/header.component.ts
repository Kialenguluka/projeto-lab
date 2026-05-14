import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { AppLanguage, LanguageService } from '../core/services/language.service';
import { Currency, ExchangeRateService } from '../core/services/exchange-rate.service';
import { CartService } from '../core/services/cart.service';

interface Lang {
  code: AppLanguage;
  flag: string;
  name: string;
}

interface NavItem {
  labelKey: string;
  href: string;
  icon: string;
  match?: string;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly exchangeRate = inject(ExchangeRateService);
  private readonly cartService = inject(CartService);
  private readonly sub: Subscription;

  readonly navItems: NavItem[] = [
    { labelKey: 'home', href: '/', icon: 'home', match: 'home' },
    { labelKey: 'products', href: '/catalogo', icon: 'bag', match: 'catalog' },
    { labelKey: 'promotions', href: '/promocoes', icon: 'spark' },
    { labelKey: 'cart', href: '/carrinho', icon: 'cart' },
  ];

  readonly languages: Lang[] = [
    { code: 'pt', flag: 'PT', name: 'Portugues' },
    { code: 'en', flag: 'EN', name: 'English' },
  ];

  readonly currencies: Currency[] = ['AOA'];

  language: Lang = this.languages[0];
  isDark = false;
  openMenu: null | 'language' | 'currency' = null;
  cartCount = 0;
  selectedCurrency: Currency = 'AOA';

  constructor() {
    // Restore dark mode from localStorage
    const savedDark = localStorage.getItem('mini_ecommerce_dark') === 'true';
    this.isDark = savedDark;
    document.documentElement.classList.toggle('dark', savedDark);

    this.language = this.languages.find((lang) => lang.code === this.languageService.language) ?? this.languages[0];
    this.selectedCurrency = this.exchangeRate.selectedCurrency;

    const langSub = this.languageService.language$.subscribe((code) => {
      this.language = this.languages.find((lang) => lang.code === code) ?? this.languages[0];
    });
    const currSub = this.exchangeRate.selectedCurrency$.subscribe((c) => {
      this.selectedCurrency = c;
    });
    // Load cart count for badge
    const cartSub = this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      error: () => { this.cartCount = 0; },
    });

    // Initial load
    this.cartService.getCart().subscribe();

    this.sub = new Subscription();
    this.sub.add(langSub);
    this.sub.add(currSub);
    this.sub.add(cartSub);
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get authUser() {
    return this.auth.getUser();
  }


  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (!this.host.nativeElement.contains(ev.target as Node)) {
      this.openMenu = null;
    }
  }

  toggleMenu(ev: MouseEvent, which: 'language' | 'currency'): void {
    ev.stopPropagation();
    this.openMenu = this.openMenu === which ? null : which;
  }

  pickLanguage(lang: Lang, ev: MouseEvent): void {
    ev.stopPropagation();
    this.languageService.setLanguage(lang.code);
    this.openMenu = null;
  }

  pickCurrency(currency: Currency, ev: MouseEvent): void {
    ev.stopPropagation();
    this.exchangeRate.setCurrency(currency);
    this.openMenu = null;
  }

  t(key: string): string {
    return this.languageService.t(key);
  }

  isActive(href: string): boolean {
    if (href === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(href);
  }

  isActiveItem(item: NavItem): boolean {
    const url = this.router.url;
    if (item.match === 'home') {
      return url === '/';
    }
    if (item.match === 'catalog') {
      return url.startsWith('/catalogo') && !url.includes('category=');
    }
    return this.isActive(item.href);
  }

  logout(): void {
    if (confirm('Tem a certeza que deseja sair do sistema?')) {
      this.auth.logout();
      void this.router.navigate(['/']);
    }
  }


  toggleTheme(ev: MouseEvent): void {
    ev.stopPropagation();
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('mini_ecommerce_dark', String(this.isDark));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
