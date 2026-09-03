import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function AdminOperators() {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuthStore();
  
  const sidebarItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { title: 'Farmers', path: '/admin/farmers', icon: '🧑‍🌾' },
    { title: 'Companies', path: '/admin/companies', icon: '🏢' },
    { title: 'Operators', path: '/admin/operators', icon: '👨‍💼' },
    { title: 'Centres', path: '/admin/centres', icon: '🏭' },
    { title: 'Crops', path: '/admin/crops', icon: '🌾' },
    { title: 'Slots', path: '/admin/slots', icon: '📅' },
    { title: 'Audit Logs', path: '/admin/logs', icon: '📋' },
    { title: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admin/operators`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch operators');
      const data = await res.json();
      setOperators(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleUpdateStatus = async (id: number, is_approved: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admin/operators/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_approved })
      });
      
      if (!res.ok) throw new Error('Failed to update operator status');
      fetchOperators(); // refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole="Admin"
      userName="System Administrator"
      onLogout={() => {
        logout();
        window.location.href = '/admin/login';
      }}
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Operators</h1>
          <p className="text-slate-500">Manage and approve procurement operators.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Operator ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Loading operators...
                    </td>
                  </tr>
                ) : operators.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No operators found.
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{op.operator_id}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{op.email}</td>
                      <td className="p-4">
                        {op.email_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          op.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {op.is_approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {!op.is_approved ? (
                          <button
                            onClick={() => handleUpdateStatus(op.id, true)}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(op.id, false)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
