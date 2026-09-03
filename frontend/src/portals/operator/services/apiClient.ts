const BASE_URL = import.meta.env.VITE_OPERATOR_API_URL || 'http://localhost:8000/api/v1';
export const USE_MOCK_API = false;

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('op_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    if (USE_MOCK_API) {
      console.warn(`[Mock API] GET ${endpoint}`);
      throw new Error('MOCK_ENABLED');
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('op_token');
        localStorage.removeItem('op_user');
        window.location.href = '/';
      }
      const err = await response.json().catch(() => ({ message: 'HTTP request failed' }));
      throw new Error(err.message || `GET ${endpoint} failed with status ${response.status}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    if (USE_MOCK_API) {
      console.warn(`[Mock API] POST ${endpoint}`, body);
      throw new Error('MOCK_ENABLED');
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('op_token');
        localStorage.removeItem('op_user');
        window.location.href = '/';
      }
      const err = await response.json().catch(() => ({ message: 'HTTP request failed' }));
      throw new Error(err.message || `POST ${endpoint} failed with status ${response.status}`);
    }
    return response.json();
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    if (USE_MOCK_API) {
      console.warn(`[Mock API] PUT ${endpoint}`, body);
      throw new Error('MOCK_ENABLED');
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('op_token');
        localStorage.removeItem('op_user');
        window.location.href = '/';
      }
      const err = await response.json().catch(() => ({ message: 'HTTP request failed' }));
      throw new Error(err.message || `PUT ${endpoint} failed with status ${response.status}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
