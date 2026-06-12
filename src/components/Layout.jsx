import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'home' },
  { to: '/projects', label: 'projects' },
  { to: '/resume', label: 'resume' },
];

export default function Layout() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="shell">
      <header className="header">
        <nav className="nav-tabs" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <NavLink className="footer-impressum" to="/impressum">
          Imprint & Privacy (c) {currentYear} David Bingmann
        </NavLink>
      </footer>
    </div>
  );
}
