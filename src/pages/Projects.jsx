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
            style={{ '--delay': `${index * 120}ms` }}
          >
            <h2 className="project-card-title">
              <Link className="project-title-link" to={`/projects/${project.slug}`}>
                {project.title} Project
              </Link>
            </h2>
            <p className="project-card-headline">{project.headline}</p>
            <p className="project-card-summary">{project.summary}</p>

            <p className="project-card-meta">
              <a href={project.repo.href} target="_blank" rel="noreferrer">
                {project.repo.label}
              </a>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
