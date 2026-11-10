import { Link, useParams } from 'react-router-dom';
import BackLink from '../components/BackLink.jsx';
import Markdown from '../components/Markdown.jsx';
import posts from '../content/posts.json';
import { formatPostDate } from '../content/posts.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Post() {
  const { slug } = useParams();
  const post = posts.find((entry) => entry.slug === slug);

  useDocumentTitle(post ? post.title : 'Not found');

  return (
    <>
      <BackLink />
      <div className="prose">
        {!post ? (
          <>
            <h1 className="page-title">Post not found</h1>
            <p>
              This post doesn't exist. <Link to="/">Back to the homepage</Link>.
            </p>
          </>
        ) : (
          <>
            <h1 className="page-title">{post.title}</h1>
            <p className="pmeta pmeta--prose">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </p>
            <Markdown source={post.body} />
          </>
        )}
      </div>
    </>
  );
}
