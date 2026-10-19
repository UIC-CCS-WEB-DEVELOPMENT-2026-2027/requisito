import { Link, NavLink, Outlet } from 'react-router-dom'
import DisclaimerBanner from './DisclaimerBanner.jsx'
import Footer from './Footer.jsx'
import '../App.css'

function Layout() {
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
