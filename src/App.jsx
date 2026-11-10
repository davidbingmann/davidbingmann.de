import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Impressum from './pages/Impressum.jsx';

// Pages with a Markdown body load with the renderer only when opened, so the
// home page never downloads it. Layout shows them inside a Suspense.
const Post = lazy(() => import('./pages/Post.jsx'));
const Project = lazy(() => import('./pages/Project.jsx'));
// Loaded only when /admin is opened, so visitors never download it. Caddy
// sends every /admin and /api/admin request through the Authelia login first.
const Admin = lazy(() => import('./pages/admin/Admin.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Outside the Layout, so the view counter never sees the admin pages. */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/projects/:slug" element={<Project />} />
          <Route path="/posts/:slug" element={<Post />} />
          {/* Projects and resume moved onto the home page, and the public
              Insights page into the admin panel; anything else unknown lands
              there too, rather than on an empty page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
