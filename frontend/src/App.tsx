import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import LoginPage from './pages/LoginPage';

// Admin Portal
import AdminLogin from './portals/admin/pages/admin/AdminLogin';
import AdminDashboard from './portals/admin/pages/admin/AdminDashboard';
import AdminCompanies from './portals/admin/pages/admin/AdminCompanies';
import AdminCentres from './portals/admin/pages/admin/AdminCentres';
import AdminCrops from './portals/admin/pages/admin/AdminCrops';
import { AdminFarmers } from './portals/admin/pages/admin/AdminFarmers';
import AdminOperators from './portals/admin/pages/admin/AdminOperators';
import AdminSettings from './portals/admin/pages/admin/AdminSettings';
import CompanyLogin from './portals/admin/pages/company/CompanyLogin';
import CompanyRegister from './portals/admin/pages/company/CompanyRegister';
import CompanyDashboard from './portals/admin/pages/company/CompanyDashboard';
import { useAuthStore } from './portals/admin/stores/authStore';

// Farmer & Operator Portals
import FarmerApp from './portals/farmer/FarmerApp';
import OperatorApp from './portals/operator/OperatorApp';

const AdminProtectedRoute = ({ children, allowedRole }: { children: ReactElement, allowedRole: string }) => {
  const { token, role } = useAuthStore();
  if (!token || !role || role.toUpperCase() !== allowedRole.toUpperCase()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Farm2Market Unified Login Page — main entry point */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Farmer Portal - its own router inside */}
        <Route path="/farmer/*" element={<FarmerApp />} />

        {/* Operator Portal - manages its own view state */}
        <Route path="/operator/*" element={<OperatorApp />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Navigate to="/" replace />} />
        <Route path="/admin/*" element={
          <AdminProtectedRoute allowedRole="ADMIN">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="operators" element={<AdminOperators />} />
              <Route path="centres" element={<AdminCentres />} />
              <Route path="crops" element={<AdminCrops />} />
              <Route path="farmers" element={<AdminFarmers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminProtectedRoute>
        } />
        
        {/* Company Routes */}
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/*" element={
          <AdminProtectedRoute allowedRole="PROCUREMENT_COMPANY">
            <Routes>
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
            </Routes>
          </AdminProtectedRoute>
        } />

        {/* Catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
