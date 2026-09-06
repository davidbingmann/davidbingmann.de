import { Link } from 'react-router-dom';
import ExternalLink from '../components/ExternalLink.jsx';
import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import profilePicture400 from '../assets/profile_picture_400.webp';
import profilePicture600 from '../assets/profile_picture_600.webp';
import { timelineItems } from '../data/timeline.jsx';
import { projects } from '../data/projects.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/david-bingmann-13b897293/',
    Icon: FaLinkedinIn,
  },
  { label: 'GitHub', href: 'https://github.com/davidbingmann', Icon: FaGithub },
  { label: 'X', href: 'https://x.com/dxv1d04', Icon: FaXTwitter },
  { label: 'Mail', href: 'mailto:contact@davidbingmann.de', Icon: FaEnvelope },
];

const software = projects.filter((project) => project.type === 'software');
const papers = projects.filter((project) => project.type === 'paper');

export default function Home() {
  useDocumentTitle();

  return (
    <>
      <div id="dhead">
        <div id="dpic">
          <img
            src={profilePicture400}
            srcSet={`${profilePicture400} 2x, ${profilePicture600} 3x`}
            alt="Portrait of David Bingmann"
            fetchPriority="high"
          />
        </div>
        <div>
          <h1>David Bingmann</h1>
          <p className="lede">Fascinated by machines that think 🧠🤖</p>
          <div id="dico">
            {socialLinks.map(({ label, href, Icon }) => (
              <ExternalLink key={href} className="iico" href={href} aria-label={label}>
                <Icon aria-hidden="true" />
              </ExternalLink>
            ))}
          </div>
        </div>
      </div>

      <h2 className="ctitle">Background</h2>
      {timelineItems.map((item, index) => (
        <div className="entry" key={index}>
          <div className="yr">
            <span className="num">{item.year}</span>
            {item.until && <small>{item.until}</small>}
          </div>
          <div className="ico">
            <div className="dot" />
            {item.logo && (
              <span className="logo-tile">
                <img
                  src={item.logo.src}
                  alt={item.logo.alt}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            )}
          </div>
          <div className="desc">{item.body}</div>
        </div>
      ))}

      <h2 className="ctitle">Publications</h2>
      {papers.map((project) => (
        <div className="pub" key={project.slug}>
          <p className="ptitle">
            <Link to={`/projects/${project.slug}`}>{project.title}</Link>
          </p>
          <p className="pub-venue">{project.venue}</p>
          <p className="pub-meta">
            David Bingmann &middot;{' '}
            <ExternalLink href={project.link.href}>
              {project.link.label}
            </ExternalLink>
          </p>
        </div>
      ))}

      <h2 className="ctitle">Projects</h2>
      {software.map((project) => (
        <div className="project" key={project.slug}>
          <p className="ptitle">
            <Link to={`/projects/${project.slug}`}>{project.title}</Link>
          </p>
          <p>{project.summary}</p>
        </div>
      ))}
    </>
  );
}
