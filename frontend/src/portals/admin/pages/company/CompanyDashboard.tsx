import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompanyDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch profile and stats
    setLoading(false);
  }, []);

  const sidebarItems = [
    { title: 'Dashboard', path: '/company/dashboard', icon: '📊' },
    { title: 'Procurement Requirements', path: '/company/requirements', icon: '🌾' },
    { title: 'Reports', path: '/company/reports', icon: '📈' },
    { title: 'Settings', path: '/company/settings', icon: '⚙️' },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole="Company"
      userName={profile?.company_name || 'Company Portal'}
      onLogout={() => {
        // handle logout
        window.location.href = '/company/login';
      }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your procurement requirements and view insights.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <span className="text-xl">🌾</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Crops</dt>
                  <dd className="text-lg font-bold text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <span className="text-xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Target Quantity</dt>
                  <dd className="text-lg font-bold text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Procurement Fulfilment Trend</h2>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart
              data={[
                { name: 'Mon', Target: 4000, Procured: 2400 },
                { name: 'Tue', Target: 4000, Procured: 1398 },
                { name: 'Wed', Target: 4000, Procured: 9800 },
                { name: 'Thu', Target: 4000, Procured: 3908 },
                { name: 'Fri', Target: 4000, Procured: 4800 },
                { name: 'Sat', Target: 4000, Procured: 3800 },
                { name: 'Sun', Target: 4000, Procured: 4300 },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Target" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Procured" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
