import { api } from './api';

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Login real com o backend
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const data = await api.post('/auth/login', { email, password });
  return data;
};

// Salva token no localStorage
export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Busca token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Remove token (logout)
export const logout = () => {
  localStorage.removeItem('token');
};

// Verifica se está autenticado
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};