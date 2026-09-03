import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
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

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admin/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch companies');
      const data = await res.json();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admin/companies/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      fetchCompanies(); // refresh list
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Companies</h1>
          <p className="text-gray-600 mt-1">Manage and approve procurement companies.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner / Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No companies found.</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                    <div className="text-sm text-gray-500">GST: {company.gst_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.owner_name}</div>
                    <div className="text-sm text-gray-500">ID: {company.user_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.district}, {company.state}</div>
                    <div className="text-sm text-gray-500">PIN: {company.pincode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      company.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {company.approval_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {company.approval_status === 'PENDING' && (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleUpdateStatus(company.id, 'APPROVED')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded">Approve</button>
                        <button onClick={() => handleUpdateStatus(company.id, 'REJECTED')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded">Reject</button>
                      </div>
                    )}
                    {company.approval_status === 'APPROVED' && (
                       <button onClick={() => handleUpdateStatus(company.id, 'REJECTED')} className="text-red-600 hover:text-red-900">Revoke</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
