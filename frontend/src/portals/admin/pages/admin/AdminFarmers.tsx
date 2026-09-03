import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const AdminFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/farmers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch farmers');
      const data = await res.json();
      setFarmers(data);
    } catch (error) {
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Registered Farmers</h1>
          <p className="text-gray-600 mt-1">Manage farmers registered on the platform.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Farmer ID</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Mobile</th>
                <th className="px-6 py-3 font-medium">Village</th>
                <th className="px-6 py-3 font-medium">District</th>
                <th className="px-6 py-3 font-medium">State</th>
                <th className="px-6 py-3 font-medium">Registration Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No farmers registered yet.</td>
                </tr>
              ) : (
                farmers.map(farmer => (
                  <tr key={farmer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">{farmer.farmer_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{farmer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farmer.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{farmer.village}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farmer.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farmer.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(farmer.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
