import { Link, useParams } from 'react-router-dom';
import BackLink from '../components/BackLink.jsx';
import ExternalLink from '../components/ExternalLink.jsx';
import { projects } from '../data/projects.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Project() {
  const { slug } = useParams();
  const project = projects.find((entry) => entry.slug === slug);

  useDocumentTitle(project ? project.title : 'Not found');

  return (
    <>
      <BackLink />
      <div className="prose">
        {!project ? (
          <>
            <h1 className="page-title">Project not found</h1>
            <p>
              That project does not exist. <Link to="/">Back to the start</Link>.
            </p>
          </>
        ) : (
          <>
            <h1 className="page-title">{project.title}</h1>
            <p className="lede">{project.headline}</p>
            {/* A URL reads better in monospace; a written label does not. */}
            <p
              className={
                project.type === 'paper' ? 'pmeta pmeta--prose' : 'pmeta'
              }
            >
              <ExternalLink href={project.link.href}>
                {project.link.label}
              </ExternalLink>
            </p>
            {project.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </>
        )}
      </div>
    </>
  );
}
