import { useEffect } from 'react';

export default function Projects() {
  useEffect(() => {
    document.title = 'Projects - David Bingmann';
  }, []);

  return (
    <section className="section">
      <h1 className="section-title">projects/</h1>
      <div className="empty-note">Nothing to see here yet!</div>
    </section>
  );
}
