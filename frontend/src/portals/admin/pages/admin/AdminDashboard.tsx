import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();
  
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="text-gray-600 mt-1">Real-time statistics and system management.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading statistics...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Farmers</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_farmers || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Companies</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_companies || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Operators</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_operators || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Procurement Centres</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_centres || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Today's Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.today_bookings || 0}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Procurement by Centre (Current Week)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'AMC Guntur', 'Grade A': 400, 'Grade B': 240 },
                { name: 'AMC Tenali', 'Grade A': 300, 'Grade B': 139 },
                { name: 'Godavari', 'Grade A': 200, 'Grade B': 980 },
                { name: 'Kisan Seva', 'Grade A': 278, 'Grade B': 390 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Grade A" fill="#10B981" />
                <Bar dataKey="Grade B" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Crop Distribution</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paddy', value: 400 },
                    { name: 'Wheat', value: 300 },
                    { name: 'Maize', value: 300 },
                    { name: 'Cotton', value: 200 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {
                    [
                      { name: 'Paddy', value: 400 },
                      { name: 'Wheat', value: 300 },
                      { name: 'Maize', value: 300 },
                      { name: 'Cotton', value: 200 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'][index % 4]} />
                    ))
                  }
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
