import { useEffect } from 'react';
import { timelineItems } from '../data/timeline.js';

export default function Resume() {
  useEffect(() => {
    document.title = 'Resume - David Bingmann';
  }, []);

  return (
    <section className="section">
      <h1 className="section-title">resume/</h1>
      <div className="timeline">
        {timelineItems.map((item, index) => (
          <article
            key={`${item.title}-${item.year}`}
            className="timeline-item"
            style={{ '--delay': `${index * 120}ms` }}
          >
            <p className="timeline-year">{item.year}</p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
