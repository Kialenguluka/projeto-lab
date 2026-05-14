import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductItem } from '../../core/services/product.service';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-card.component.html',
})
export class PropertyCardComponent implements OnInit {
  private readonly favorites = inject(FavoritesService);
  public readonly exchangeRate = inject(ExchangeRateService);

  @Input({ required: true }) product!: ProductItem;
  @Input() promotion = false;

  isFavorite = false;

  ngOnInit(): void {
    this.isFavorite = this.favorites.isFavorite(this.product.id);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFavorite = this.favorites.toggle(this.product.id);
  }

  get name(): string {
    return this.product.name_pt || this.product.name_en;
  }

  get description(): string {
    return this.product.description_pt || this.product.description_en || 'Produto disponivel na loja.';
  }

  get image(): string {
    return this.product.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop';
  }

  get oldPrice(): number {
    return this.product.price * 1.25;
  }
}
