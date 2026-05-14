import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'pt' | 'en';

const DICTIONARY: Record<AppLanguage, Record<string, string>> = {
  pt: {
    home: 'Início',
    products: 'Produtos',
    promotions: 'Promoções',
    cart: 'Carrinho',
    orders: 'Encomendas',
    profile: 'Perfil',
    sell: 'Vender na MiniStore AO',
    register: 'Registar',
    login: 'Iniciar sessão',
    logout: 'Sair',
    adminPanel: 'Painel Admin',
    heroTitle: 'Encontre os seus produtos favoritos',
    heroSubtitle: 'Pesquise ofertas em tecnologia, casa, beleza e muito mais.',
    searchPlaceholder: 'O que deseja comprar?',
    allCategories: 'Todas as categorias',
    inStock: 'Produtos em stock',
    search: 'Pesquisar',
    why: 'Por que MiniStore AO?',
    featured: 'Produtos em destaque',
    featuredSubtitle: 'Escolhas populares para compradores da MiniStore AO.',
    viewCatalog: 'Ver catálogo',
    loadingProducts: 'A carregar produtos...',
    apiEmpty: 'Ligue a API para ver os produtos cadastrados.',
    saveTitle: 'Inicie sessão para poupar',
    saveText: 'Guarde o carrinho, acompanhe encomendas e veja ofertas especiais para a sua conta.',
    signup: 'Registe-se',
  },
  en: {
    home: 'Home',
    products: 'Products',
    promotions: 'Deals',
    cart: 'Cart',
    orders: 'Orders',
    profile: 'Profile',
    sell: 'Sell on MiniStore AO',
    register: 'Register',
    login: 'Sign in',
    logout: 'Sign out',
    adminPanel: 'Admin Panel',
    heroTitle: 'Find your favorite products',
    heroSubtitle: 'Search deals in technology, fashion, home, beauty and much more.',
    searchPlaceholder: 'What do you want to buy?',
    allCategories: 'All categories',
    inStock: 'In-stock products',
    search: 'Search',
    why: 'Why MiniStore AO?',
    featured: 'Featured products',
    featuredSubtitle: 'Popular picks for MiniStore AO shoppers.',
    viewCatalog: 'View catalog',
    loadingProducts: 'Loading products...',
    apiEmpty: 'Connect the API to see registered products.',
    saveTitle: 'Sign in to save',
    saveText: 'Save your cart, track orders and see special offers for your account.',
    signup: 'Create account',
  },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly key = 'mini_ecommerce_language';
  private readonly languageSubject = new BehaviorSubject<AppLanguage>(this.initialLanguage());
  readonly language$ = this.languageSubject.asObservable();

  get language(): AppLanguage {
    return this.languageSubject.value;
  }

  setLanguage(language: AppLanguage): void {
    localStorage.setItem(this.key, language);
    this.languageSubject.next(language);
  }

  t(key: string): string {
    return DICTIONARY[this.language][key] ?? DICTIONARY.pt[key] ?? key;
  }

  private initialLanguage(): AppLanguage {
    const saved = localStorage.getItem(this.key);
    return saved === 'en' ? 'en' : 'pt';
  }
}
