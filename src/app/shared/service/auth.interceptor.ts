import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Nur für API-Requests
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  // Versuche, Token aus localStorage zu holen
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Kein Token vorhanden, Request ohne Auth-Header
  return next(req);
};

