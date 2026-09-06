import { Link, Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';

export default function Layout() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container">
      <ScrollToTop />
      <Outlet />
      <footer className="footer">
        <Link to="/impressum">Imprint &amp; Privacy</Link> &middot; &copy;{' '}
        {currentYear} David Bingmann
      </footer>
    </div>
  );
}
