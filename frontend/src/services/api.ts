// Base URL do backend
const API_URL = import.meta.env.VITE_API_URL || 'http://backend:3000';

// Helper para fazer requisições autenticadas
export const api = {
    async post(endpoint: string, body: object) {
        const token = localStorage.getItem('token');
      
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
      
        const data = await response.json();
      
        if (!response.ok) {
          throw new Error(data.message || 'Erro na requisição');
        }
      
        return data;
      },

  async get(endpoint: string) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  },
};