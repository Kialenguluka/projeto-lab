import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

export interface ProductItem {
  id: number;
  category_id: number;
  category_slug?: string;
  category_name?: string;
  name_pt: string;
  name_en: string;
  description_pt: string;
  description_en: string;
  price: number;
  stock: number;
  image_url: string;
  active?: number;
}

export interface ProductCollection {
  items: ProductItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  list(search?: string, category?: string, page: number = 1, limit: number = 12): Observable<ProductCollection> {
    return this.api
      .get<ProductCollection>('/products', {
        search: search ?? '',
        category: category ?? '',
        page: page.toString(),
        limit: limit.toString(),
      })
      .pipe(map((response) => response.data));
  }

  show(productId: number): Observable<ProductItem> {
    return this.api
      .get<{ product: ProductItem }>(`/products/${productId}`)
      .pipe(map((response) => response.data.product));
  }
}
