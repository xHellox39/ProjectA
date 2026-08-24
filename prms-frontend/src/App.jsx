import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
        <Route path="users" element={<AdminSimplePage type="users" />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<AdminSimplePage type="bookings" />} />
        <Route path="finance" element={<AdminSimplePage type="finance" />} />
        <Route path="maintenance" element={<AdminSimplePage type="maintenance" />} />
        <Route path="messages" element={<AdminSimplePage type="messages" />} />
        <Route path="reports" element={<AdminSimplePage type="reports" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<AdminSimplePage type="help" />} />
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
        <Route path="bookings" element={<LandlordSimplePage type="bookings" />} />
        <Route path="finance" element={<LandlordSimplePage type="finance" />} />
        <Route path="maintenance" element={<LandlordSimplePage type="maintenance" />} />
        <Route path="messages" element={<LandlordSimplePage type="messages" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<LandlordSimplePage type="help" />} />
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
        <Route path="bookings" element={<TenantSimplePage type="bookings" />} />
        <Route path="payments" element={<TenantSimplePage type="payments" />} />
        <Route path="maintenance" element={<TenantSimplePage type="maintenance" />} />
        <Route path="messages" element={<TenantSimplePage type="messages" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<TenantSimplePage type="help" />} />
      </Route>

      {/*  Fallback  */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
