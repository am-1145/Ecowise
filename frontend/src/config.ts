export const API_URL =
  (window as any).ENV?.VITE_API_URL && (window as any).ENV.VITE_API_URL !== '__VITE_API_URL__'
    ? (window as any).ENV.VITE_API_URL
    : import.meta.env.VITE_API_URL || '/api';
