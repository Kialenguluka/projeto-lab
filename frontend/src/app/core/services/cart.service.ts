import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { map } from 'rxjs';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name_pt: string;
  name_en: string;
  price: number;
  stock: number;
  image_url: string;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly cartSubject = new BehaviorSubject<CartResponse>({ items: [], total: 0 });
  readonly cart$ = this.cartSubject.asObservable();

  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>('/cart').pipe(
      map((response) => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItem(productId: number, quantity = 1): Observable<CartResponse> {
    return this.api
      .post<{ cart: CartItem[] }>('/cart/items', { productId, quantity })
      .pipe(
        map((response) => this.toCartResponse(response.data.cart)),
        tap(cart => this.cartSubject.next(cart))
      );
  }

  updateItem(cartItemId: number, quantity: number): Observable<CartResponse> {
    return this.api
      .put<{ cart: CartItem[] }>(`/cart/items/${cartItemId}`, { quantity })
      .pipe(
        map((response) => this.toCartResponse(response.data.cart)),
        tap(cart => this.cartSubject.next(cart))
      );
  }

  removeItem(cartItemId: number): Observable<CartResponse> {
    return this.api
      .delete<{ cart: CartItem[] }>(`/cart/items/${cartItemId}`)
      .pipe(
        map((response) => this.toCartResponse(response.data.cart)),
        tap(cart => this.cartSubject.next(cart))
      );
  }

  checkout(addressId: number, paymentMethod = 'cash', notes = ''): Observable<{ orderId: number }> {
    return this.api
      .post<{ orderId: number }>('/cart/checkout', { addressId, paymentMethod, notes })
      .pipe(
        tap(() => this.cartSubject.next({ items: [], total: 0 })),
        map((response) => response.data)
      );
  }

  private toCartResponse(items: CartItem[]): CartResponse {
    return {
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
  }
}
