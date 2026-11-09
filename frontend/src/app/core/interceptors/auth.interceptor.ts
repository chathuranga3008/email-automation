import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // The browser automatically sends same-origin session cookies.
  // Angular's built-in XSRF interceptor handles the XSRF-TOKEN cookie
  // and X-XSRF-TOKEN header for state-changing requests.

  return next(req);
};
