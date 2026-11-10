import { useEffect, useState } from 'react';
import { formatDate } from '../../content/posts.js';
import { loadStats } from './api.js';
import posts from '../../content/posts.json';
import projects from '../../content/projects.json';

const W = 800;
const H = 200;
const GRID_LINES = 4;

const formatNumber = (n) => n.toLocaleString('en-US');

const sum = (entries) => entries.reduce((total, entry) => total + entry.views, 0);

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
  const peak = Math.max(...current.map((d) => d.views));
  const ceiling = niceCeiling(Math.max(peak, ...previous.map((d) => d.views)));
  const x = (i) => (i / (current.length - 1)) * W;
  const y = (value) => H - (value / ceiling) * H;
  const line = (days) => smoothPath(days.map((d, i) => [x(i), y(d.views)]));

  const onPointerMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.max(0, Math.min(current.length - 1, Math.round(ratio * (current.length - 1)))));
  };

  const day = hover === null ? null : current[hover];
  const left = `${(hover / (current.length - 1)) * 100}%`;

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
          aria-label={`Daily page views over the last 30 days, peaking at ${formatNumber(peak)}`}
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
            <span className="insight-dot is-previous" style={{ left, top: `${(y(previous[hover].views) / H) * 100}%` }} />
            <span className="insight-dot" style={{ left, top: `${(y(day.views) / H) * 100}%` }} />
            <div
              className={`insight-tooltip ${hover > current.length / 2 ? 'is-left' : ''}`}
              style={{ left }}
            >
              <strong>{formatDate(day.day, { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
              <span>{formatNumber(day.views)} views</span>
              <span className="insight-tooltip-prev">
                {formatNumber(previous[hover].views)} views 30 days earlier
              </span>
            </div>
          </>
        )}
      </div>
      <figcaption className="insight-legend">
        <span><i className="insight-key" /> Views per day</span>
        <span><i className="insight-key is-previous" /> The 30 days before</span>
      </figcaption>
    </figure>
  );
}

const PAGE_TITLES = {
  '/': 'Home page',
  '/impressum': 'Imprint & Privacy',
  ...Object.fromEntries(projects.map((p) => [`/projects/${p.slug}`, p.title])),
  ...Object.fromEntries(posts.map((p) => [`/posts/${p.slug}`, p.title])),
};

// Days are counted in UTC, so the hours are shown in UTC too; otherwise
// "Today" and the hour chart would disagree for an hour or two after midnight.
const formatHour = (key) =>
  new Date(`${key}:00:00Z`).toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

/** One bar per hour of the last 24. */
function HourChart({ hours }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...hours.map((h) => h.views));
  const hovered = hover === null ? null : hours[hover];

  return (
    <figure className="insight-chart">
      <div
        className="hour-plot"
        role="img"
        aria-label={`Page views per hour over the last 24 hours, ${formatNumber(sum(hours))} in total`}
        onPointerLeave={() => setHover(null)}
      >
        {hours.map((h, i) => (
          <div key={h.hour} className="hour-slot" onPointerEnter={() => setHover(i)}>
            <span
              className={`hour-bar ${hover === i ? 'is-hover' : ''}`}
              style={{ height: `${(h.views / max) * 100}%` }}
            />
          </div>
        ))}
        {hovered && (
          <div
            className={`insight-tooltip ${hover > hours.length / 2 ? 'is-left' : ''}`}
            style={{ left: `${((hover + 0.5) / hours.length) * 100}%` }}
          >
            <strong>{formatHour(hovered.hour)}</strong>
            <span>{formatNumber(hovered.views)} views</span>
          </div>
        )}
      </div>
      <div className="hour-axis" aria-hidden="true">
        {hours.map((h, i) => (
          <span key={h.hour}>{i % 6 === 0 ? formatHour(h.hour) : ''}</span>
        ))}
      </div>
    </figure>
  );
}

function PageTable({ paths }) {
  if (!paths.length) return <p className="insight-lede">No page has been opened in the last 30 days.</p>;
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th scope="col">Page</th>
          <th scope="col" className="is-number">Views</th>
        </tr>
      </thead>
      <tbody>
        {paths.map(({ path, views }) => (
          <tr key={path}>
            <td>
              <a href={path} target="_blank" rel="noopener noreferrer">
                {PAGE_TITLES[path] || path}
              </a>
            </td>
            <td className="is-number">{formatNumber(views)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Stats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats().then(setData, (e) => setError(e.message));
  }, []);

  if (!data?.days?.length) {
    return <p className="insight-lede">{error || 'Loading the numbers…'}</p>;
  }

  const half = data.days.length / 2;
  const previous = data.days.slice(0, half);
  const current = data.days.slice(half);
  const today = current[current.length - 1];
  const { hours } = data;
  const thisHour = hours[hours.length - 1];
  const total = sum(current);

  return (
    <>
      <dl className="insight-stats">
        <div>
          <dt>Views in 30 days <Change current={total} previous={sum(previous)} /></dt>
          <dd>{formatNumber(total)}</dd>
        </div>
        <div>
          <dt>Today (UTC)</dt>
          <dd>{formatNumber(today.views)}</dd>
        </div>
        <div>
          <dt>Last 24 hours</dt>
          <dd>{formatNumber(sum(hours))}</dd>
        </div>
        <div>
          <dt>This hour (UTC)</dt>
          <dd>{formatNumber(thisHour.views)}</dd>
        </div>
      </dl>

      <h2 className="admin-heading">Last 24 hours, in UTC</h2>
      <HourChart hours={hours} />

      <h2 className="admin-heading">
        {formatDate(current[0].day, { day: 'numeric', month: 'short' })} to{' '}
        {formatDate(today.day, { day: 'numeric', month: 'short' })}
      </h2>
      <Chart current={current} previous={previous} />

      <h2 className="admin-heading">Pages in the last 30 days</h2>
      <PageTable paths={data.paths} />
    </>
  );
}
