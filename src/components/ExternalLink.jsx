/**
 * A link that leaves the site. Opens in a new tab and withholds the referrer,
 * except for mailto: and other non-web schemes, where a new tab would just
 * leave a blank window behind.
 */
export default function ExternalLink({ href, children, ...rest }) {
  const opensNewTab = href.startsWith('http');

  return (
    <a
      href={href}
      target={opensNewTab ? '_blank' : undefined}
      rel={opensNewTab ? 'noreferrer' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
