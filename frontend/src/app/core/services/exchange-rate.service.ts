import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, map, of } from 'rxjs';

export type Currency = 'AOA';

export interface ExchangeRates {
  AOA: number;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private readonly ratesSubject = new BehaviorSubject<ExchangeRates>({ AOA: 1, updatedAt: 'base' });
  readonly rates$ = this.ratesSubject.asObservable();

  private readonly selectedCurrencySubject = new BehaviorSubject<Currency>('AOA');
  readonly selectedCurrency$ = this.selectedCurrencySubject.asObservable();

  get selectedCurrency(): Currency {
    return 'AOA';
  }

  setCurrency(currency: Currency): void {
    this.selectedCurrencySubject.next('AOA');
  }

  convert(amountAOA: number): number {
    return amountAOA;
  }

  formatPrice(amountAOA: number): string {
    return `AOA ${amountAOA.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
