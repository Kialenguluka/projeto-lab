import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-popular-destinations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './popular-destinations.component.html',
})
export class PopularDestinationsComponent {
  readonly tabs = ['Cidades internacionais', 'Países'] as const;
  readonly internationalCities = ['Hotéis em Orlando', 'Estados Unidos da América'];
  readonly categories = [
    'Países',
    'Regiões',
    'Cidades',
    'Distritos',
    'Aeroportos',
    'Hotéis',
    'Locais de interesse',
    'Casas de Férias',
    'Apartamentos',
    'Resorts',
    'Villas',
    'Hostels',
    'B&B',
    'Casas de Hóspedes',
  ];

  activeTab = 0;

  setTab(i: number): void {
    this.activeTab = i;
  }
}
