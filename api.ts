export const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : 'http://localhost:8080';

export const apiUrl = (path: string) => `${API_BASE}${path}`;

export default apiUrl;
