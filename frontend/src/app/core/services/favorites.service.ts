import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly key = 'mini_ecommerce_favorites';
  private readonly idsSubject = new BehaviorSubject<number[]>(this.read());
  readonly ids$ = this.idsSubject.asObservable();

  isFavorite(productId: number): boolean {
    return this.idsSubject.value.includes(productId);
  }

  toggle(productId: number): boolean {
    const current = this.idsSubject.value;
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    localStorage.setItem(this.key, JSON.stringify(next));
    this.idsSubject.next(next);
    return next.includes(productId);
  }

  private read(): number[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.key) ?? '[]');
      return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
}
