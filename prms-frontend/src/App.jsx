import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Login from './pages/Login'
import Register from './pages/Register'
import RoleSelection from './pages/RoleSelection'

import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminSimplePage from './pages/AdminSimplePage'

import LandlordLayout from './components/LandlordLayout'
import LandlordDashboard from './pages/LandlordDashboard'
import LandlordSimplePage from './pages/LandlordSimplePage'

import TenantLayout from './components/TenantLayout'
import TenantDashboard from './pages/TenantDashboard'
import TenantSimplePage from './pages/TenantSimplePage'

import Properties from './pages/Properties'
import PublicPageTransition from './components/PublicPageTransition'

function AppRoutes() {
  const location = useLocation()
  const isPublicPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/role'

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={isPublicPage ? location.pathname : 'dashboard-routes'}>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            <PublicPageTransition>
              <Login />
            </PublicPageTransition>
          }
        />

        <Route
          path="/register"
          element={
            <PublicPageTransition>
              <Register />
            </PublicPageTransition>
          }
        />

        <Route
          path="/role"
          element={
            <PublicPageTransition>
              <RoleSelection />
            </PublicPageTransition>
          }
        />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminSimplePage type="users" />} />
          <Route path="properties" element={<AdminSimplePage type="properties" />} />
          <Route path="bookings" element={<AdminSimplePage type="bookings" />} />
          <Route path="finance" element={<AdminSimplePage type="finance" />} />
          <Route path="maintenance" element={<AdminSimplePage type="maintenance" />} />
          <Route path="messages" element={<AdminSimplePage type="messages" />} />
          <Route path="reports" element={<AdminSimplePage type="reports" />} />
          <Route path="settings" element={<AdminSimplePage type="settings" />} />
          <Route path="help" element={<AdminSimplePage type="help" />} />
        </Route>

        <Route path="/landlord" element={<LandlordLayout />}>
          <Route index element={<LandlordDashboard />} />
          <Route path="properties" element={<LandlordSimplePage type="properties" />} />
          <Route path="bookings" element={<LandlordSimplePage type="bookings" />} />
          <Route path="finance" element={<LandlordSimplePage type="finance" />} />
          <Route path="maintenance" element={<LandlordSimplePage type="maintenance" />} />
          <Route path="messages" element={<LandlordSimplePage type="messages" />} />
          <Route path="settings" element={<LandlordSimplePage type="settings" />} />
          <Route path="help" element={<LandlordSimplePage type="help" />} />
        </Route>

        <Route path="/tenant" element={<TenantLayout />}>
          <Route index element={<TenantDashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="bookings" element={<TenantSimplePage type="bookings" />} />
          <Route path="payments" element={<TenantSimplePage type="payments" />} />
          <Route path="maintenance" element={<TenantSimplePage type="maintenance" />} />
          <Route path="messages" element={<TenantSimplePage type="messages" />} />
          <Route path="settings" element={<TenantSimplePage type="settings" />} />
          <Route path="help" element={<TenantSimplePage type="help" />} />
        </Route>

        <Route path="/properties" element={<Navigate to="/tenant/properties" />} />
        <Route path="/settings" element={<Navigate to="/admin/settings" />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App