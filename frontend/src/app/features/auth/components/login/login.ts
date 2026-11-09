import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';

  readonly csrfReady = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.authService.getCsrfToken().subscribe({
      next: () => {
        this.csrfReady.set(true);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to initialize secure login. Please refresh the page.',
        );
      },
    });
  }

  onSubmit(): void {
    if (!this.csrfReady() || this.loading()) {
      return;
    }

    this.errorMessage.set('');
    this.loading.set(true);

    this.authService
      .login({
        username: this.username.trim(),
        password: this.password,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.password = '';

          // Obtain a fresh CSRF token after authentication.
          this.authService.getCsrfToken().subscribe({
            next: () => {
              const requestedUrl =
                this.route.snapshot.queryParamMap.get('returnUrl');

              const returnUrl =
                requestedUrl?.startsWith('/') &&
                  !requestedUrl.startsWith('//') &&
                  requestedUrl !== '/login'
                  ? requestedUrl
                  : '/dashboard';

              this.router.navigateByUrl(returnUrl);
            },
            error: () => {
              this.authService.clearAuthentication();

              this.errorMessage.set(
                'Login succeeded, but security initialization failed. Please try again.',
              );
            },
          });
        },
        error: (error) => {
          this.errorMessage.set(
            error.status === 401
              ? 'Invalid username or password.'
              : 'Login failed. Please try again later.',
          );
        },
      });
  }
}
