import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  private readonly languageService = inject(LanguageService);

  readonly currentYear = new Date().getFullYear();

  readonly footerSections = [
    {
      titleKey: 'footerExplore',
      links: [
        { labelKey: 'footerCatalog', route: '/catalogo' },
        { labelKey: 'footerPromotions', route: '/promocoes' },
        { labelKey: 'footerNews', route: '/novidades' },
        { labelKey: 'footerBestsellers', route: '/mais-vendidos' },
      ],
    },
    {
      titleKey: 'footerAccount',
      links: [
        { labelKey: 'footerProfile', route: '/perfil' },
        { labelKey: 'footerOrders', route: '/encomendas' },
        { labelKey: 'footerCart', route: '/carrinho' },
      ],
    },
    {
      titleKey: 'footerAdministration',
      links: [
        { labelKey: 'footerAdminDashboard', route: '/admin' },
        { labelKey: 'footerAdminStock', route: '/admin/produtos' },
        { labelKey: 'footerAdminCategories', route: '/admin/categorias' },
        { labelKey: 'footerAdminReports', route: '/admin/relatorios' },
      ],
    },
    {
      titleKey: 'footerInstitutional',
      links: [
        { labelKey: 'footerAbout', route: '/sobre' },
        { labelKey: 'footerTerms', route: '/termos' },
        { labelKey: 'footerPrivacy', route: '/privacidade' },
        { labelKey: 'footerContacts', route: '/contactos' },
      ],
    },
  ];

  t(key: string): string {
    return this.languageService.t(key);
  }
}

