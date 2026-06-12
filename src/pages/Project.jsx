import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projects.js';

export default function Project() {
  const { slug } = useParams();
  const project = projects.find((entry) => entry.slug === slug);

  useEffect(() => {
    document.title = project
      ? `${project.title} - Projects - David Bingmann`
      : 'Projects - David Bingmann';
  }, [project]);

  if (!project) {
    return (
      <section className="section">
        <h1 className="section-title">projects/</h1>
        <div className="empty-note">
          Project not found. <Link to="/projects">Back to projects</Link>.
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="project-breadcrumb">
        <Link className="project-breadcrumb-link" to="/projects">
          projects
        </Link>
        <span className="project-breadcrumb-sep">/</span>
        <span className="project-breadcrumb-current">{project.title}</span>
      </div>

      <div className="project-head">
        <h1 className="section-title section-title--case-sensitive">
          {project.title}
        </h1>
        <span className={`tag tag--${project.type}`}>{project.type}</span>
      </div>

      <div className="project-detail">
        <p className="project-headline">{project.headline}</p>

        <p className="project-detail-link">
          <a
            className="project-card-link"
            href={project.repo.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="project-card-link-arrow">→</span>{' '}
            {project.repo.linkText}
          </a>
        </p>

        {project.body.map((paragraph, index) => (
          <p
            key={paragraph}
            className="project-detail-paragraph"
            style={{ '--delay': `${250 + index * 150}ms` }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
