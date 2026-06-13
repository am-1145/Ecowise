const rawUrl =
  (window as any).ENV?.VITE_API_URL && (window as any).ENV.VITE_API_URL !== '__VITE_API_URL__'
    ? (window as any).ENV.VITE_API_URL
    : import.meta.env.VITE_API_URL || '/api';

export const API_URL = (() => {
  if (!rawUrl) return '/api';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return trimmed === '' ? '/api' : `${trimmed}/api`;
})();
