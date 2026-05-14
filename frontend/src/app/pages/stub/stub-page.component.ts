import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stub-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-2xl font-bold text-foreground">Página em construção</h1>
      <p class="mt-2 text-muted-foreground">
        <a routerLink="/" class="text-primary underline hover:no-underline">Voltar ao início</a>
      </p>
    </div>
  `,
})
export class StubPageComponent {}
