import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AuthUser {
  username: string;
  authenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = signal(false);

  /**
   * Retrieve the CSRF token before authentication requests.
   */
  getCsrfToken(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/csrf`);
  }

  /**
   * Authenticate the administrator.
   */
  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        }),
      );
  }

  /**
   * Restore authentication state from the backend session.
   */
  checkSession(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }),
    );
  }

  /**
   * Log out the administrator.
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }),
    );
  }

  /**
   * Clear local authentication state.
   */
  clearAuthentication(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }
}
