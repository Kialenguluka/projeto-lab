import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header.component';
import { FooterComponent } from '../../layout/footer.component';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-termos',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './termos.component.html',
})
export class TermosComponent {
  private readonly languageService = inject(LanguageService);

  t(key: string): string {
    return this.languageService.t(key);
  }
}
