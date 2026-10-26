import { Suspense, useState } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AdminAuthProvider from './AdminAuth.jsx'
import { useAdminAuth } from './AdminAuthContext.js'
import {
  AdminAudit,
  AdminDashboard,
  AdminLoginPage,
  AdminRecordDetail,
  AdminRecords,
  AdminReview,
  AdminUsers,
} from './Pages.jsx'
import './admin.css'

function AdminGuard() {
  const { status, error } = useAdminAuth()
  const location = useLocation()
  if (status === 'loading') return <p role="status">Checking admin session…</p>
  if (status === 'anonymous') return <Navigate to="/admin/login" replace state={{ from: location }} />
  if (status === 'forbidden') return <p role="alert">Access denied (403): {error}</p>
  if (status === 'error') return <p role="alert">Could not check admin access: {error}</p>
  return <Outlet />
}

function RequireRole({ role, children }) {
  const { user } = useAdminAuth()
  if (user?.role !== role && user?.role !== 'admin') {
    return <section className="admin-card" role="alert">
      <h1>Access denied (403)</h1>
      <p>This page requires the {role} role. Your account is {user?.role ?? 'unknown'}.</p>
      <Link to="/admin">Return to admin dashboard</Link>
    </section>
  }
  return children
}

function AdminShell() {
  const { user, logout } = useAdminAuth()
  const location = useLocation()
  const [logoutError, setLogoutError] = useState('')
  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
    } catch (failure) {
      setLogoutError(failure.message)
    }
  }
  return (
    <main className="admin-layout" aria-label="Requisito administration">
      <header className="admin-header">
        <div>
          <Link to="/admin" className="admin-brand">Requisito · Admin</Link>
          <p>Signed in as {user.username} ({user.role})</p>
        </div>
        <button type="button" onClick={handleLogout}>Sign out</button>
      </header>
      {logoutError && <p className="admin-error" role="alert">Sign-out failed: {logoutError}</p>}
      <nav className="admin-nav" aria-label="Admin navigation">
        <Link to="/admin" aria-current={location.pathname === '/admin' ? 'page' : undefined}>Dashboard</Link>
        <Link to="/admin/records">Records</Link>
        <Link to="/admin/review">Review requests</Link>
        {user.role === 'admin' && <>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/audit">Audit log</Link>
        </>}
        <Link to="/">Public site</Link>
      </nav>
      <section className="admin-content"><Outlet /></section>
    </main>
  )
}

function AdminRouteTree() {
  return (
    <Suspense fallback={<p role="status" className="admin-loading">Loading admin page…</p>}>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminGuard />}>
          <Route element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="records" element={<AdminRecords />} />
            <Route path="records/:type/:id" element={<AdminRecordDetail />} />
            <Route path="review" element={<AdminReview />} />
            <Route path="users" element={<RequireRole role="admin"><AdminUsers /></RequireRole>} />
            <Route path="audit" element={<RequireRole role="admin"><AdminAudit /></RequireRole>} />
            <Route path="*" element={<section className="admin-card"><h1>Admin page not found</h1><Link to="/admin">Return to dashboard</Link></section>} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminRouteTree />
    </AdminAuthProvider>
  )
}
