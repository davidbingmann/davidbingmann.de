import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projects } from '../data/projects.js';

export default function Projects() {
  const [searchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  useEffect(() => {
    document.title = 'Projects - David Bingmann';
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set();
    projects.forEach((project) => project.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, []);

  const visibleProjects = activeTag
    ? projects.filter((project) => project.tags.includes(activeTag))
    : projects;

  return (
    <section className="section">
      <h1 className="section-title">projects/</h1>

      <div className="tag-row" aria-label="Project tag filter">
        <Link className={`tag${activeTag ? '' : ' tag--active'}`} to="/projects">
          all
        </Link>
        {allTags.map((tag) => (
          <Link
            key={tag}
            className={`tag${activeTag === tag ? ' tag--active' : ''}`}
            to={`/projects?tag=${encodeURIComponent(tag)}`}
          >
            #{tag}
          </Link>
        ))}
      </div>

      {visibleProjects.length === 0 ? (
        <div className="empty-note">No projects found for that tag.</div>
      ) : (
        <div className="project-list">
          {visibleProjects.map((project, index) => (
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

              <div className="tag-row tag-row--compact" aria-label="Project tags">
                {project.tags.map((tag) => (
                  <Link key={tag} className="tag" to={`/projects?tag=${encodeURIComponent(tag)}`}>
                    #{tag}
                  </Link>
                ))}
              </div>

              <p className="project-card-meta">
                <a href={project.repo.href} target="_blank" rel="noreferrer">
                  {project.repo.label}
                </a>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
