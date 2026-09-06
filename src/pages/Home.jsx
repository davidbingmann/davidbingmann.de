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

// Looked up by label so the bio's links cannot drift from the icon row.
const social = Object.fromEntries(socialLinks.map(({ label, href }) => [label, href]));

const software = projects.filter((project) => project.type === 'software');
const papers = projects.filter((project) => project.type === 'paper');

export default function Home() {
  useDocumentTitle();

  return (
    <>
      <div id="dhead">
        <div id="dpic">
          {/* The slot is 190px wide, 240px below the 700px breakpoint; both
              mirror --portrait-w in styles.css. */}
          <img
            src={profilePicture400}
            srcSet={`${profilePicture400} 400w, ${profilePicture600} 600w`}
            sizes="(max-width: 700px) 240px, 190px"
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

      <h2 className="ctitle">Bio</h2>
      <div className="prose">
        <p>
          I study Business Informatics &amp; Artificial Intelligence at the
          University of Trier and work as a research assistant at the German
          Research Center for Artificial Intelligence (DFKI). The projects
          below started as problems I had myself. If you want to talk about
          them, or about AI in general,{' '}
          <ExternalLink href={social.Mail}>send me an email</ExternalLink>. You
          can also find me on{' '}
          <ExternalLink href={social.LinkedIn}>LinkedIn</ExternalLink>,{' '}
          <ExternalLink href={social.GitHub}>GitHub</ExternalLink> and{' '}
          <ExternalLink href={social.X}>X</ExternalLink>.
        </p>
      </div>

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
