import { Link } from 'react-router-dom';

/** The way back to the home page from a sub page. */
export default function BackLink() {
  return (
    <Link className="backlink" to="/">
      <span className="backlink-arrow" aria-hidden="true">
        &larr;
      </span>
      David Bingmann
    </Link>
  );
}
