import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map(() => true),
    catchError(() => {
      authService.clearAuthentication();

      return of(
        router.createUrlTree(['/login'], {
          queryParams: {
            returnUrl: state.url,
          },
        }),
      );
    }),
  );
};
