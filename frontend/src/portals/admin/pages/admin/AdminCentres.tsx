import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function AdminCentres() {
  const [centres, setCentres] = useState<any[]>([]);
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
    const fetchCentres = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/centres`);
        const data = await res.json();
        setCentres(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Procurement Centres</h1>
          <p className="text-gray-600 mt-1">Manage physical procurement locations.</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Add Centre</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centre Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : centres.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.village}, {c.district}, {c.state}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.daily_capacity} slots/day</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
