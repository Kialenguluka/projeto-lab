import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-register.component.html',
})
export class AuthRegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  isSuccess = false;
  selectedFile: File | null = null;

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  async onSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    this.errorMessage = '';
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As palavras-passe não coincidem.';
      return;
    }
    this.isLoading = true;
    try {
      await this.auth.register(this.name, this.email, this.password, this.selectedFile || undefined);
      this.auth.logout(); // Remove the auto-login token
      this.isSuccess = true;
    } catch (err: any) {

      let msg = err?.error?.message;
      if (err?.error?.errors) {
        const values = Object.values(err.error.errors);
        if (values.length > 0) msg = values[0];
      }
      this.errorMessage = msg || 'Não foi possível criar a conta. Confirme os dados.';
    } finally {
      this.isLoading = false;
    }
  }
}
