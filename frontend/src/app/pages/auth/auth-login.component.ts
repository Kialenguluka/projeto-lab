import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-login.component.html',
})
export class AuthLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  async onSubmit(ev: Event): Promise<void> {
    ev.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigate(['/']);
    } catch (err: any) {
      const msg = err?.error?.message;
      this.errorMessage = msg || 'Email ou palavra-passe inválido.';
    } finally {
      this.isLoading = false;
    }
  }
}
