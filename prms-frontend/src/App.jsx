import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import PageTransition from './components/PageTransition';
import PublicPageTransition from './components/PublicPageTransition';

/* ── Public pages ────────────────────────────────────── */
import Login from './pages/Login';
import Register from './pages/Register';

/* ── Admin ───────────────────────────────────────────── */
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminSimplePage from './pages/AdminSimplePage';

/* ── Landlord ────────────────────────────────────────── */
import LandlordLayout from './components/LandlordLayout';
import LandlordDashboard from './pages/LandlordDashboard';
import LandlordSimplePage from './pages/LandlordSimplePage';

/* ── Tenant ──────────────────────────────────────────── */
import TenantLayout from './components/TenantLayout';
import TenantDashboard from './pages/TenantDashboard';
import TenantSimplePage from './pages/TenantSimplePage';

/* ── Shared ──────────────────────────────────────────── */
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
      <Route path="/" element={<Navigate to="/admin" replace />} />
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

      {/* ── Admin ──────────────────────────────────────── */}
      
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="index" element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminSimplePage label="User Management" />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<AdminSimplePage label="Booking Management" />} />
        <Route path="finance" element={<AdminSimplePage label="Finance Console" />} />
        <Route path="maintenance" element={<AdminSimplePage label="Maintenance Center" />} />
        <Route path="messages" element={<AdminSimplePage label="Admin Messages" />} />
        <Route path="reports" element={<AdminSimplePage label="Reports & Audit" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<AdminSimplePage label="Admin Help Center" />} />
      </Route>

      {/* ── Landlord ──────────────────────────────────── */}
      <Route
        path="/landlord/*"
        element={
          <ProtectedRoute>
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
        <Route path="help" element={<LandlordSimplePage label="Help Center" />} />
      </Route>

      {/* ── Tenant ──────────────────────────────────────── */}
      <Route
        path="/tenant/*"
        element={
          <ProtectedRoute>
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
        <Route path="help" element={<TenantSimplePage label="Help Center" />} />
      </Route>

      {/* ── Fallback ──────────────────────────────────── */}
      <Route path="*" element={<Login />} />
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
