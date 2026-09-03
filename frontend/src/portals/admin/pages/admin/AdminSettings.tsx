import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export default function AdminSettings() {
  const { logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure global application settings.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
          <div className="mt-2 flex items-center">
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={() => setNotifications(!notifications)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded" 
            />
            <label className="ml-2 block text-sm text-gray-900">Enable system alert emails</label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Maintenance Mode</h3>
          <div className="mt-2 flex items-center">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-red-600 border-gray-300 rounded" 
            />
            <label className="ml-2 block text-sm text-gray-900">Temporarily disable farmer logins</label>
          </div>
        </div>
        
        <div className="pt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Changes</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
