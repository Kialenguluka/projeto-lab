import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface CategoryItem {
  id: number;
  name_pt: string;
  name_en: string;
  slug: string;
  active?: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  list(): Observable<CategoryItem[]> {
    return this.api
      .get<{ items: CategoryItem[] }>('/categories')
      .pipe(map((response) => response.data.items));
  }
}
