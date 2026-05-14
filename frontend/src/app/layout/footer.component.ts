import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly footerSections = [
    {
      title: 'Explorar',
      links: [
        { label: 'Catálogo de Produtos', route: '/catalogo' },
        { label: 'Promoções Ativas', route: '/promocoes' },
        { label: 'Novidades', route: '/novidades' },
        { label: 'Mais Vendidos', route: '/mais-vendidos' },
      ],
    },
    {
      title: 'Minha Conta',
      links: [
        { label: 'Meu Perfil', route: '/perfil' },
        { label: 'Minhas Encomendas', route: '/encomendas' },
        { label: 'Carrinho de Compras', route: '/carrinho' },
      ],
    },
    {
      title: 'Administração',
      links: [
        { label: 'Painel Geral', route: '/admin' },
        { label: 'Gerir Stock', route: '/admin/produtos' },
        { label: 'Gestão de Categorias', route: '/admin/categorias' },
        { label: 'Relatórios de Vendas', route: '/admin/relatorios' },
      ],
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Sobre a MiniStore AO', route: '/sobre' },
        { label: 'Termos e Condições', route: '/termos' },
        { label: 'Política de Privacidade', route: '/privacidade' },
        { label: 'Contactos', route: '/contactos' },
      ],
    },
  ];
}

