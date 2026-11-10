import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import ExternalLink from '../../components/ExternalLink.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { loadBuild, loadContent, saveCollection } from './api.js';
import Editor, { KINDS } from './Editor.jsx';
import Stats from './Stats.jsx';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/publications', label: 'Publications' },
  { to: '/admin/posts', label: 'Posts' },
];

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function ago(iso) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  return Math.abs(minutes) < 60 ? relative.format(minutes, 'minute') : relative.format(Math.round(minutes / 60), 'hour');
}

/** What GitHub Actions is doing with the latest commit on main. */
function BuildStatus({ savedAt }) {
  const [build, setBuild] = useState(null);

  useEffect(() => {
    let timer;
    let stopped = false;
    const check = async () => {
      const latest = await loadBuild().catch(() => null);
      if (stopped) return;
      setBuild(latest);
      // Keep watching while a build runs, and for a while after a save, since
      // GitHub takes a moment to start the run.
      const recentlySaved = savedAt && Date.now() - savedAt < 90_000;
      if (latest && (latest.status !== 'completed' || recentlySaved)) timer = setTimeout(check, 10_000);
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [savedAt]);

  if (!build) return null;
  const message = `“${build.message}”`;
  if (build.status !== 'completed') {
    return <p className="admin-build">Building {message}. It goes live a few minutes after the build finishes.</p>;
  }
  if (build.conclusion !== 'success') {
    return (
      <p className="admin-build is-error">
        The build of {message} failed, so the site still shows the version before it.{' '}
        <ExternalLink href={build.url}>See what went wrong</ExternalLink>
      </p>
    );
  }
  return (
    <p className="admin-build">
      Last build: {message}, finished {ago(build.updated_at)}. The server picks up a finished build within 5 minutes.
    </p>
  );
}

export default function Admin() {
  useDocumentTitle('Admin');
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    loadContent().then(setContent, (e) => setError(e.message));
  }, []);

  const save = useCallback(
    async (collection, items, message, files) => {
      const result = await saveCollection(collection, items, content[collection].sha, message, files);
      setContent((current) => ({ ...current, [collection]: { items: result.items, sha: result.sha } }));
      setSavedAt(Date.now());
    },
    [content]
  );

  const editor = (kindName) =>
    content ? (
      <Editor key={kindName} kindName={kindName} items={content[KINDS[kindName].collection].items} onSave={save} />
    ) : (
      <p className="insight-lede">{error || 'Loading the content…'}</p>
    );

  return (
    <div className="container admin">
      <header className="admin-head">
        <h1 className="page-title">Admin</h1>
        <a className="admin-sitelink" href="/" target="_blank" rel="noopener noreferrer">
          Open the site
        </a>
      </header>
      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <BuildStatus savedAt={savedAt} />
      <Routes>
        <Route index element={<Stats />} />
        <Route path="projects" element={editor('projects')} />
        <Route path="publications" element={editor('publications')} />
        <Route path="posts" element={editor('posts')} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}
