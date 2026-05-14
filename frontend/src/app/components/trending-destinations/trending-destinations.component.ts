import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TRENDING_DESTINATIONS } from '../../mock-data';

@Component({
  selector: 'app-trending-destinations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trending-destinations.component.html',
})
export class TrendingDestinationsComponent {
  readonly destinations = TRENDING_DESTINATIONS;

  slug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  get largeDestinations() {
    return this.destinations.filter((d) => d.size === 'large');
  }

  get smallDestinations() {
    return this.destinations.filter((d) => d.size === 'small');
  }
}
