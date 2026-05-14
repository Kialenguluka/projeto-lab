import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user?: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'mini_ecommerce_token';
  private readonly userKey = 'mini_ecommerce_user';

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.getUser());
  readonly user$ = this.userSubject.asObservable();

  login(email: string, password: string): Promise<AuthResponse> {
    return lastValueFrom(
      this.http
        .post<{ data: AuthResponse }>('http://localhost:8000/api/auth/login', {
          email,
          password,
        })
        .pipe(
          map((response) => {
            if (response.data?.token) {
              this.setToken(response.data.token);
              this.setUser(response.data.user);
            }
            return response.data;
          }),
        ),
    );
  }

  register(name: string, email: string, password: string, avatar?: File): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', password);
    if (avatar) formData.append('avatar', avatar);

    return lastValueFrom(
      this.http
        .post<{ data: AuthResponse }>('http://localhost:8000/api/auth/register', formData)
        .pipe(
          map((response) => {
            if (response.data?.token) {
              this.setToken(response.data.token);
              this.setUser(response.data.user);
            }
            return response.data;
          }),
        ),
    );
  }

  fetchMe(): Promise<AuthUser> {
    return lastValueFrom(
      this.http
        .get<{ data: { user: AuthUser } }>('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${this.getToken()}` },
        })
        .pipe(
          map((response) => {
            const user = response.data?.user;
            if (user) this.setUser(user);
            return user;
          }),
        ),
    );
  }

  updateMe(data: { name: string; email: string; currentPassword?: string; newPassword?: string; avatar?: File }): Promise<AuthUser> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.currentPassword) formData.append('currentPassword', data.currentPassword);
    if (data.newPassword) formData.append('newPassword', data.newPassword);
    if (data.avatar) formData.append('avatar', data.avatar);

    // Using POST for updateMe because PUT with FormData can be tricky in some PHP setups
    // But since our router handles it, we can try POST and check backend routes
    return lastValueFrom(
      this.http
        .post<{ data: AuthUser }>('http://localhost:8000/api/auth/me', formData, {
          headers: { Authorization: `Bearer ${this.getToken()}` },
        })
        .pipe(
          map((response) => {
            const user = response.data;
            if (user) this.setUser(user);
            return user;
          }),
        ),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setUser(user: AuthUser | undefined): void {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.userSubject.next(user);
    }
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}
