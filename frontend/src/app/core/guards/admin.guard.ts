import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    } else {
      this.router.navigate(['/']);
    }
    return false;
  }
}

export const adminGuard: CanActivateFn = () => {
  return inject(AdminGuardService).canActivate();
};
