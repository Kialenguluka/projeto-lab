import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ExchangeRateService, Currency } from '../../core/services/exchange-rate.service';
import { FooterComponent } from '../../layout/footer.component';
import { HeaderComponent } from '../../layout/header.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly exchangeRate = inject(ExchangeRateService);

  activeTab: 'profile' | 'security' | 'preferences' = 'profile';

  profile = {
    name: '',
    email: '',
  };

  passwords = { current: '', new: '', confirm: '' };

  preferences = {
    language: this.languageService.language,
    currency: this.exchangeRate.selectedCurrency as Currency,
    darkMode: localStorage.getItem('mini_ecommerce_dark') === 'true',
  };

  profileMessage = '';
  profileError = '';
  passwordMessage = '';
  passwordError = '';
  prefMessage = '';
  loadingProfile = false;
  loadingPassword = false;

  selectedFile: File | null = null;
  avatarUrl: string | null = null;

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.profile.name = user.name;
      this.profile.email = user.email;
      if (user.avatar) this.avatarUrl = 'http://localhost:8000/' + user.avatar;
    }
    // Try to refresh from server
    if (this.authService.isAuthenticated()) {
      this.authService.fetchMe().then((user) => {
        if (user) {
          this.profile.name = user.name;
          this.profile.email = user.email;
          if (user.avatar) this.avatarUrl = 'http://localhost:8000/' + user.avatar;
        }
      }).catch(() => {});
    }
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Preview
      const reader = new FileReader();
      reader.onload = () => { this.avatarUrl = reader.result as string; };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onProfileSave(ev: Event): void {
    ev.preventDefault();
    this.profileMessage = '';
    this.profileError = '';
    this.loadingProfile = true;

    this.authService.updateMe({ 
      name: this.profile.name, 
      email: this.profile.email, 
      avatar: this.selectedFile || undefined 
    })
      .then(() => {
        this.profileMessage = 'Perfil atualizado com sucesso!';
        this.loadingProfile = false;
        this.selectedFile = null;
      })
      .catch((err: any) => {
        const msg = err?.error?.errors?.email ?? err?.error?.message ?? 'Erro ao atualizar perfil.';
        this.profileError = msg;
        this.loadingProfile = false;
      });
  }


  onPasswordChange(ev: Event): void {
    ev.preventDefault();
    this.passwordMessage = '';
    this.passwordError = '';

    if (this.passwords.new !== this.passwords.confirm) {
      this.passwordError = 'As novas palavras-passe não coincidem.';
      return;
    }
    if (this.passwords.new.length < 8) {
      this.passwordError = 'A nova palavra-passe deve ter pelo menos 8 caracteres.';
      return;
    }
    this.loadingPassword = true;

    this.authService.updateMe({
      name: this.profile.name,
      email: this.profile.email,
      currentPassword: this.passwords.current,
      newPassword: this.passwords.new,
    }).then(() => {
      this.passwordMessage = 'Palavra-passe alterada com sucesso!';
      this.passwords = { current: '', new: '', confirm: '' };
      this.loadingPassword = false;
    }).catch((err: any) => {
      const msg = err?.error?.message ?? 'Palavra-passe atual incorreta.';
      this.passwordError = msg;
      this.loadingPassword = false;
    });
  }

  savePreferences(): void {
    this.languageService.setLanguage(this.preferences.language);
    this.exchangeRate.setCurrency(this.preferences.currency);
    document.documentElement.classList.toggle('dark', this.preferences.darkMode);
    localStorage.setItem('mini_ecommerce_dark', String(this.preferences.darkMode));
    this.prefMessage = 'Preferências guardadas!';
    setTimeout(() => { this.prefMessage = ''; }, 3000);
  }
}
