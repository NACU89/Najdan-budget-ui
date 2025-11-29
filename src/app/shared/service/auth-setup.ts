/**
 * Temporäre Lösung: Setzt ein Auth-Token für die API-Authentifizierung
 * 
 * Um ein Token zu setzen, öffne die Browser-Konsole und führe aus:
 * localStorage.setItem('authToken', 'dein-token-hier');
 * 
 * Oder verwende den Dev-Auth-Endpoint, falls vorhanden.
 */

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
  console.log('Auth token gesetzt');
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  console.log('Auth token entfernt');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

