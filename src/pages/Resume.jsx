import { useEffect } from 'react';
import { timelineItems } from '../data/timeline.js';

export default function Resume() {
  useEffect(() => {
    document.title = 'Resume - David Bingmann';
  }, []);

  return (
    <section className="section">
      <h1 className="section-title">resume/</h1>
      <div className="resume-timeline">
        {timelineItems.map((item, index) => (
          <article
            key={`${item.title}-${item.period}`}
            className="resume-item"
            style={{ '--delay': `${index * 180}ms` }}
          >
            <span
              className={`resume-dot${item.current ? ' resume-dot--current' : ''}`}
            />
            <div className="resume-card">
              <span className={`tag tag--${item.category}`}>
                {item.category}
              </span>
              <div className="resume-card-row">
                <h3 className="resume-card-title">
                  {item.title}
                  {item.current && <span className="resume-badge">current</span>}
                </h3>
                <span className="resume-period">{item.period}</span>
              </div>
              {item.description && (
                <p className="resume-card-description">{item.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
