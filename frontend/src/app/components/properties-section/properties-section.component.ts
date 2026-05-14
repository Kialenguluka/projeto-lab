import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import type { PropertyListing } from '../../mock-data';
import { RouterLink } from '@angular/router';
import { PropertyCardComponent } from '../property-card/property-card.component';

@Component({
  selector: 'app-properties-section',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent, RouterLink],
  templateUrl: './properties-section.component.html',
})
export class PropertiesSectionComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input({ required: true }) properties!: PropertyListing[];
  @Input() showLink = false;
  @Input() linkText = 'Ver mais';
  @Input() linkHref = '/';

  @ViewChild('scrollBox') scrollBox?: ElementRef<HTMLDivElement>;

  scroll(direction: 'left' | 'right'): void {
    const el = this.scrollBox?.nativeElement;
    if (!el) {
      return;
    }
    const amount = direction === 'left' ? -300 : 300;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }
}
