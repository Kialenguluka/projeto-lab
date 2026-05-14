import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Address {
  id?: number;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}


export interface AddressResponse {
  data: Address[];
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly api = inject(ApiService);

  getAddresses(): Observable<Address[]> {
    return this.api.get<Address[]>('/addresses').pipe(
      map((response) => {
        // Handle both response.data and direct array
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return (response as any).addresses || [];
      }),
    );
  }

  addAddress(address: Address): Observable<Address> {
    return this.api.post<Address>('/addresses', address).pipe(
      map((response) => {
        if (response.data && typeof response.data === 'object') {
          return response.data;
        }
        return address;
      }),
    );
  }

  updateAddress(id: number, address: Address): Observable<Address> {
    return this.api.put<Address>(`/addresses/${id}`, address).pipe(
      map((response) => {
        if (response.data && typeof response.data === 'object') {
          return response.data;
        }
        return { ...address, id };
      }),
    );
  }

  deleteAddress(id: number): Observable<void> {
    return this.api.delete<void>(`/addresses/${id}`).pipe(
      map(() => undefined),
    );
  }
}
