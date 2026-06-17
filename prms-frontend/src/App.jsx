import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import PublicPageTransition from './components/PublicPageTransition';

/*  Public pages  */
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';

/*  Admin  */
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminSimplePage from './pages/AdminSimplePage';

/*  Landlord  */
import LandlordLayout from './components/LandlordLayout';
import LandlordDashboard from './pages/LandlordDashboard';
import LandlordSimplePage from './pages/LandlordSimplePage';

/*  Tenant  */
import TenantLayout from './components/TenantLayout';
import TenantDashboard from './pages/TenantDashboard';
import TenantSimplePage from './pages/TenantSimplePage';

/*  Shared  */
import Properties from './pages/Properties';
import Settings from './pages/Settings';
import WebsiteCustomizer from './pages/WebsiteCustomizer';

function AppRoutes() {
  const { loading, user } = useAuth();

  /* Block rendering routes until hydration is done */
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading PRMS...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/*  Public routes (auth-001: RoleSelection -> Register -> Login)  */}
      <Route
        path="/role-selection"
        element={
          <PublicRoute>
            <PublicPageTransition>
              <RoleSelection />
            </PublicPageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <PublicPageTransition>
              <Login />
            </PublicPageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <PublicPageTransition>
              <Register />
            </PublicPageTransition>
          </PublicRoute>
        }
      />

      {/*  Admin routes (AUTH-006: role-protected)  */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminSimplePage label="User Management" />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<AdminSimplePage label="Booking Management" />} />
        <Route path="finance" element={<AdminSimplePage label="Finance Console" />} />
        <Route path="maintenance" element={<AdminSimplePage label="Maintenance Center" />} />
        <Route path="messages" element={<AdminSimplePage label="Admin Messages" />} />
        <Route path="reports" element={<AdminSimplePage label="Reports & Audit" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/customizer" element={<WebsiteCustomizer />} />
        <Route path="help" element={<AdminSimplePage label="Admin Help Center" />} />
      </Route>

      {/*  Landlord routes (AUTH-006: role-protected)  */}
      <Route
        path="/landlord/*"
        element={
          <ProtectedRoute allowedRoles={['Landlord']}>
            <LandlordLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LandlordDashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<LandlordSimplePage label="My Bookings" />} />
        <Route path="finance" element={<LandlordSimplePage label="Finance & Payments" />} />
        <Route path="maintenance" element={<LandlordSimplePage label="Maintenance Requests" />} />
        <Route path="messages" element={<LandlordSimplePage label="Messages" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/customizer" element={<WebsiteCustomizer />} />
        <Route path="help" element={<LandlordSimplePage label="Help Center" />} />
      </Route>

      {/*  Tenant routes (AUTH-006: role-protected)  */}
      <Route
        path="/tenant/*"
        element={
          <ProtectedRoute allowedRoles={['Tenant']}>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TenantDashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<TenantSimplePage label="My Bookings" />} />
        <Route path="payments" element={<TenantSimplePage label="Payments" />} />
        <Route path="maintenance" element={<TenantSimplePage label="Maintenance Requests" />} />
        <Route path="messages" element={<TenantSimplePage label="Messages" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/customizer" element={<WebsiteCustomizer />} />
        <Route path="help" element={<TenantSimplePage label="Help Center" />} />
      </Route>

      {/*  Fallback  */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
