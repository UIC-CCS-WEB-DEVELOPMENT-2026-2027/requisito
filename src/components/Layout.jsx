import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner.jsx'
import Footer from './Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './LoginForm.css'
import '../App.css'

// Props: none. Shared shell for every route.
function Layout() {
  const { isSignedIn, signOut } = useAuth()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-content">
          <Link className="brand" to="/">
            Requisito
          </Link>
          <nav aria-label="Main navigation" className="site-nav">
            <NavLink end to="/">
              Home
            </NavLink>
            <NavLink to="/goals">
              Goals
            </NavLink>
            <NavLink to="/checklist">
              Checklist
            </NavLink>
            <NavLink to="/documents">
              Documents
            </NavLink>
            {isSignedIn ? (
              <button className="nav-sign-out" type="button" onClick={signOut}>Sign out</button>
            ) : (
              !isLoginPage && <NavLink to="/login">Sign in</NavLink>
            )}
          </nav>
        </div>
      </header>

      <DisclaimerBanner />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
