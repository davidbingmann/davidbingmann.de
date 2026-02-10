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
          projects/
        </Link>
        <span className="project-breadcrumb-sep">/</span>
        <span className="project-breadcrumb-current">{project.slug}</span>
      </div>

      <h1 className="section-title">{project.title}</h1>

      <div className="section-body">
        <p className="project-headline">{project.headline}</p>

        <p>
          <a href={project.repo.href} target="_blank" rel="noreferrer">
            GitHub: {project.repo.label}
          </a>
        </p>

        <div className="tag-row tag-row--compact" aria-label="Project tags">
          {project.tags.map((tag) => (
            <Link key={tag} className="tag" to={`/projects?tag=${encodeURIComponent(tag)}`}>
              #{tag}
            </Link>
          ))}
        </div>

        {project.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

