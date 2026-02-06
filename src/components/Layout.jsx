import { NavLink, Outlet } from 'react-router-dom';
import githubIcon from '../assets/icons/github.svg';
import linkedinIcon from '../assets/icons/linkedin.svg';
import xIcon from '../assets/icons/x.svg';
import mailIcon from '../assets/icons/mail.svg';

const navItems = [
  { to: '/', label: 'home' },
  { to: '/projects', label: 'projects' },
  { to: '/resume', label: 'resume' },
];

const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/david-bingmann-13b897293/',
    icon: linkedinIcon,
    external: true,
  },
  {
    label: 'Mail',
    href: 'mailto:contact@davidbingmann.de',
    icon: mailIcon,
    external: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/davidbingmann',
    icon: githubIcon,
    external: true,
  },
  {
    label: 'X',
    href: 'https://x.com/davidbingmann',
    icon: xIcon,
    external: true,
  },
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
        <div className="nav-divider" />
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-links">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              aria-label={link.label}
            >
              <span
                className="footer-icon"
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${link.icon})`,
                  maskImage: `url(${link.icon})`,
                }}
              />
              <span className="sr-only">{link.label}</span>
            </a>
          ))}
        </div>
        <NavLink className="footer-impressum" to="/impressum">
          Impressum (c) {currentYear} David Bingmann
        </NavLink>
      </footer>
    </div>
  );
}
