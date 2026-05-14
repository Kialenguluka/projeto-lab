import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.component.html',
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  searchTerm = '';
  currentImageIndex = 0;
  private intervalId: any;

  readonly images = [
    '/assets/images/hero-iphone.png',
    '/assets/images/hero-headphones.png',
    '/assets/images/hero-laptop.png',
  ];


  ngOnInit(): void {
    this.startImageCycle();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startImageCycle(): void {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 5000);
  }

  search(): void {
    void this.router.navigate(['/catalogo'], {
      queryParams: { search: this.searchTerm || null },
    });
  }

  t(key: string): string {
    return this.languageService.t(key);
  }
}

