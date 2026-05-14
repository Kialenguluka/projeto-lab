import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-auth-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 px-4">
      <div class="w-full max-w-md rounded-lg border bg-white dark:bg-gray-900 p-8 shadow-lg dark:border-gray-700">
        <h1 class="text-2xl font-bold text-center dark:text-white mb-2">Recuperar Palavra-passe</h1>
        
        @if (step === 'request') {
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400 text-center text-sm">
              Insira o seu email para receber instruções de recuperação
            </p>
            
            @if (successMessage) {
              <div class="p-3 bg-green-100 text-green-700 rounded dark:bg-green-900 dark:text-green-200">
                {{ successMessage }}
              </div>
            }
            
            @if (errorMessage) {
              <div class="p-3 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
                {{ errorMessage }}
              </div>
            }
            
            <div>
              <label class="block text-sm font-medium dark:text-white mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                placeholder="seu@email.com"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <button
              (click)="requestReset()"
              [disabled]="isLoading"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'A processar...' : 'Enviar' }}
            </button>
            
            <a routerLink="/auth/login" class="block text-center text-blue-600 text-sm hover:underline dark:text-blue-400">
              Voltar ao login
            </a>
          </div>
        } @else if (step === 'reset') {
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400 text-center text-sm">
              Verifique o seu email para o código de recuperação
            </p>
            
            @if (successMessage) {
              <div class="p-3 bg-green-100 text-green-700 rounded dark:bg-green-900 dark:text-green-200">
                {{ successMessage }}
              </div>
            }
            
            @if (errorMessage) {
              <div class="p-3 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
                {{ errorMessage }}
              </div>
            }
            
            <div>
              <label class="block text-sm font-medium dark:text-white mb-1">Código de Recuperação</label>
              <input
                type="text"
                [(ngModel)]="resetToken"
                placeholder="Código do email"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium dark:text-white mb-1">Nova Palavra-passe</label>
              <input
                type="password"
                [(ngModel)]="newPassword"
                placeholder="Nova palavra-passe"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium dark:text-white mb-1">Confirme a Palavra-passe</label>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                placeholder="Confirme a palavra-passe"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <button
              (click)="resetPassword()"
              [disabled]="isLoading"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'A processar...' : 'Redefinir Palavra-passe' }}
            </button>
            
            <a routerLink="/auth/login" class="block text-center text-blue-600 text-sm hover:underline dark:text-blue-400">
              Voltar ao login
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class AuthForgotPasswordComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  step: 'request' | 'reset' = 'request';
  email = '';
  resetToken = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  requestReset(): void {
    if (!this.email.trim()) {
      this.errorMessage = 'Por favor insira o seu email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.post('/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Email enviado! Verifique a sua caixa de entrada para o código de recuperação.';
        setTimeout(() => {
          this.step = 'reset';
          this.successMessage = '';
        }, 2000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Email não encontrado ou ocorreu um erro';
      },
    });
  }

  resetPassword(): void {
    if (!this.resetToken.trim() || !this.newPassword.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'Preencha todos os campos';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'As palavras-passe não coincidem';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'A palavra-passe deve ter pelo menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api
      .post('/auth/reset-password', {
        token: this.resetToken,
        password: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Palavra-passe redefinida com sucesso! Redirecionando...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Código inválido ou expirado';
        },
      });
  }
}
