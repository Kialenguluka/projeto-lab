import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header.component';
import { FooterComponent } from '../../layout/footer.component';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './sobre.component.html',
})
export class SobreComponent {
  private readonly languageService = inject(LanguageService);

  features = [
    {
      titleKey: 'aboutFeatureInnovationTitle',
      descriptionKey: 'aboutFeatureInnovationText',
      icon: 'sparkles'
    },
    {
      titleKey: 'aboutFeatureSecurityTitle',
      descriptionKey: 'aboutFeatureSecurityText',
      icon: 'shield-check'
    },
    {
      titleKey: 'aboutFeatureDeliveryTitle',
      descriptionKey: 'aboutFeatureDeliveryText',
      icon: 'truck'
    }
  ];

  t(key: string): string {
    return this.languageService.t(key);
  }
}
