import { apiClient, USE_MOCK_API } from './apiClient';
import { Operator } from '../types';

export const authService = {
  /**
   * POST /api/auth/operator/login
   */
  async login(operatorId: string, password: string): Promise<{ operator: Operator; token: string }> {
    if (USE_MOCK_API) {
      // Mock validation
      if (!operatorId || !password) {
        throw new Error('Operator ID and password are required.');
      }
      
      const mockOperator: Operator = {
        id: operatorId.toUpperCase(),
        name: operatorId.toLowerCase().includes('admin') ? 'Senior Operator S. Sharma' : 'Operator Rajesh Verma',
        centreId: 'CENTRE-APMC-402',
        centreName: 'Central APMC Procurement Hub - Centre #402',
        centreCode: 'APMC-PB-402',
        email: `${operatorId.toLowerCase()}@apmcprocure.gov.in`,
        role: 'OPERATOR',
        token: `jwt-mock-token-${Date.now()}`,
      };

      localStorage.setItem('op_token', mockOperator.token!);
      localStorage.setItem('op_user', JSON.stringify(mockOperator));
      return { operator: mockOperator, token: mockOperator.token! };
    }

    const data = await apiClient.post<{ operator: Operator; token: string }>('/auth/operator/login', {
      operatorId,
      password,
    });

    localStorage.setItem('op_token', data.token);
    localStorage.setItem('op_user', JSON.stringify(data.operator));
    return data;
  },

  getCurrentSession(): Operator | null {
    const raw = localStorage.getItem('op_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('op_token');
    localStorage.removeItem('op_user');
  },
};
