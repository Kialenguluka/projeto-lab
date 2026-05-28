import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header.component';
import { FooterComponent } from '../../layout/footer.component';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './privacidade.component.html',
})
export class PrivacidadeComponent {
  private readonly languageService = inject(LanguageService);

  t(key: string): string {
    return this.languageService.t(key);
  }
}
