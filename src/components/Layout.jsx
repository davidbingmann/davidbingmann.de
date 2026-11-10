import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import ViewBeacon from './ViewBeacon.jsx';

export default function Layout() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container">
      <ScrollToTop />
      <ViewBeacon />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <footer className="footer">
        <Link to="/impressum">Imprint &amp; Privacy</Link> &middot; &copy;{' '}
        {currentYear} David Bingmann
      </footer>
    </div>
  );
}
