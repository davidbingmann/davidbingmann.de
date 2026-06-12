import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects.js';

export default function Projects() {
  useEffect(() => {
    document.title = 'Projects - David Bingmann';
  }, []);

  return (
    <section className="section">
      <h1 className="section-title">projects/</h1>
      <div className="project-list">
        {projects.map((project, index) => (
          <article
            key={project.slug}
            className="project-card"
            style={{ '--delay': `${index * 180}ms` }}
          >
            <span className={`tag tag--${project.type}`}>{project.type}</span>
            <h2 className="project-card-title">
              <Link className="project-title-link" to={`/projects/${project.slug}`}>
                {project.title} <span className="project-card-arrow">↗</span>
              </Link>
            </h2>
            <p className="project-card-headline">{project.headline}</p>
            <p className="project-card-summary">{project.summary}</p>

            <div className="project-card-foot">
              <a
                className="project-card-link"
                href={project.repo.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="project-card-link-arrow">→</span>{' '}
                {project.repo.linkText}
              </a>
              <span className="project-card-tags">
                {project.tags.map((tag) => `#${tag}`).join(' ')}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
