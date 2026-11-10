import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BackLink from '../components/BackLink.jsx';
import projects from '../content/projects.json';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const W = 800;
const H = 200;
const GRID_LINES = 4;

const formatNumber = (n) => n.toLocaleString('en-US');
const formatDay = (iso, options) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...options });

const sum = (days, key) => days.reduce((total, day) => total + day[key], 0);

/** A curve through every point that never overshoots it (Fritsch–Carlson), so
    a quiet day is never drawn below zero or a peak above its real value. */
function smoothPath(points) {
  const n = points.length;
  if (n < 2) return '';
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    slopes.push((points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]));
  }
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === n - 1) return slopes[n - 2];
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      tangents[i] = t * a * slopes[i];
      tangents[i + 1] = t * b * slopes[i];
    }
  }
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = (x1 - x0) / 3;
    d += ` C${x0 + h},${y0 + tangents[i] * h} ${x1 - h},${y1 - tangents[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

/** Rounds the chart's ceiling up to a number the grid lines divide evenly. */
function niceCeiling(max) {
  if (max <= 0) return GRID_LINES;
  const step = max / GRID_LINES;
  const magnitude = 10 ** Math.floor(Math.log10(step));
  const nice = [1, 2, 2.5, 5, 10].find((f) => f * magnitude >= step) * magnitude;
  return nice * GRID_LINES;
}

function Change({ current, previous }) {
  if (previous === 0) return null;
  const percent = Math.round(((current - previous) / previous) * 100);
  const up = percent >= 0;
  return (
    <span
      className={`insight-change ${up ? 'is-up' : 'is-down'}`}
      title={`${up ? 'Up' : 'Down'} from ${formatNumber(previous)} in the 30 days before`}
    >
      <span aria-hidden="true">{up ? '↗' : '↘'}</span> {Math.abs(percent)}%
    </span>
  );
}

function Chart({ current, previous }) {
  const [hover, setHover] = useState(null);
  const ceiling = niceCeiling(Math.max(...current.map((d) => d.visitors), ...previous.map((d) => d.visitors)));
  const x = (i) => (i / (current.length - 1)) * W;
  const y = (value) => H - (value / ceiling) * H;
  const line = (days) => smoothPath(days.map((d, i) => [x(i), y(d.visitors)]));

  const onPointerMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.max(0, Math.min(current.length - 1, Math.round(ratio * (current.length - 1)))));
  };

  const day = hover === null ? null : current[hover];

  return (
    <figure className="insight-chart">
      <div className="insight-plot">
        {Array.from({ length: GRID_LINES }, (_, i) => {
          const value = (ceiling / GRID_LINES) * (GRID_LINES - i);
          return (
            <span key={i} className="insight-gridlabel" style={{ top: `${(i / GRID_LINES) * 100}%` }}>
              {formatNumber(value)}
            </span>
          );
        })}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Daily visitors over the last 30 days, peaking at ${formatNumber(
            Math.max(...current.map((d) => d.visitors))
          )}`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => (
            <line key={i} className="insight-grid" x1="0" x2={W} y1={(i / GRID_LINES) * H} y2={(i / GRID_LINES) * H} />
          ))}
          <path className="insight-line is-previous" d={line(previous)} />
          <path className="insight-line" d={line(current)} />
          {day && <line className="insight-crosshair" x1={x(hover)} x2={x(hover)} y1="0" y2={H} />}
        </svg>
        {day && (
          <>
            <span className="insight-dot is-previous" style={{ left: `${(hover / (current.length - 1)) * 100}%`, top: `${(y(previous[hover].visitors) / H) * 100}%` }} />
            <span className="insight-dot" style={{ left: `${(hover / (current.length - 1)) * 100}%`, top: `${(y(day.visitors) / H) * 100}%` }} />
            <div
              className={`insight-tooltip ${hover > current.length / 2 ? 'is-left' : ''}`}
              style={{ left: `${(hover / (current.length - 1)) * 100}%` }}
            >
              <strong>{formatDay(day.day, { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
              <span>{formatNumber(day.visitors)} visitors · {formatNumber(day.views)} views</span>
              <span className="insight-tooltip-prev">
                {formatNumber(previous[hover].visitors)} visitors 30 days earlier
              </span>
            </div>
          </>
        )}
      </div>
      <figcaption className="insight-legend">
        <span><i className="insight-key" /> Visitors per day</span>
        <span><i className="insight-key is-previous" /> The 30 days before</span>
      </figcaption>
    </figure>
  );
}

export default function Insights() {
  useDocumentTitle('Insights');
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/insights')
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  return (
    <>
      <BackLink />
      <h1 className="page-title">Insights</h1>
      {data?.days?.length ? (
        <Stats data={data} />
      ) : (
        <p className="insight-lede">
          {failed ? "The numbers can't be loaded right now. Try again later." : 'Loading the numbers…'}
        </p>
      )}
    </>
  );
}

function Stats({ data }) {
  const half = data.days.length / 2;
  const previous = data.days.slice(0, half);
  const current = data.days.slice(half);
  const today = current[current.length - 1];

  const titles = Object.fromEntries(projects.map((p) => [`/projects/${p.slug}`, p]));
  const topProject = data.paths.map((p) => titles[p.path]).find(Boolean);

  return (
    <>
      <p className="insight-lede">
        Who's been stopping by from {formatDay(current[0].day, { day: 'numeric', month: 'short' })} to{' '}
        {formatDay(today.day, { day: 'numeric', month: 'short' })}, counted on this server without cookies
        or third-party trackers. <Link to="/impressum#privacy">How the counting works</Link>.
      </p>

      <dl className="insight-stats">
        <div>
          <dt>Visitors <Change current={sum(current, 'visitors')} previous={sum(previous, 'visitors')} /></dt>
          <dd>{formatNumber(sum(current, 'visitors'))}</dd>
        </div>
        <div>
          <dt>Views <Change current={sum(current, 'views')} previous={sum(previous, 'views')} /></dt>
          <dd>{formatNumber(sum(current, 'views'))}</dd>
        </div>
        <div>
          <dt>Today</dt>
          <dd>{formatNumber(today.visitors)}</dd>
        </div>
        <div>
          <dt>Most-read project</dt>
          <dd className="insight-top">
            {topProject ? <Link to={`/projects/${topProject.slug}`}>{topProject.title}</Link> : '–'}
          </dd>
        </div>
      </dl>

      <Chart current={current} previous={previous} />
    </>
  );
}
