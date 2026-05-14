import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header.component';
import { FooterComponent } from '../../layout/footer.component';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './sobre.component.html',
})
export class SobreComponent {
  features = [
    {
      title: 'Inovação Angolana',
      description: 'Nascemos da vontade de modernizar o comércio digital em Angola, unindo tecnologia de ponta com as necessidades locais.',
      icon: 'sparkles'
    },
    {
      title: 'Segurança Garantida',
      description: 'Implementamos os mais rigorosos padrões de segurança para garantir que cada transação e dado pessoal esteja protegido.',
      icon: 'shield-check'
    },
    {
      title: 'Entrega Eficiente',
      description: 'Uma rede logística otimizada para que os seus produtos cheguem à sua porta com rapidez e cuidado.',
      icon: 'truck'
    }
  ];
}
