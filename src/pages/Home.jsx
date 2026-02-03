import { useEffect, useRef, useState } from 'react';
import profilePicture from '../assets/profile_picture.jpeg';

export default function Home() {
  const [typedCount, setTypedCount] = useState(0);
  const [hidePrompt, setHidePrompt] = useState(false);
  const promptRef = useRef(null);
  const [promptWidth, setPromptWidth] = useState(0);

  const fullPrompt = '~ cd';
  const fullPath = 'davidbingmann/.';
  const totalLength = fullPrompt.length + fullPath.length;

  const promptText = fullPrompt.slice(0, Math.min(typedCount, fullPrompt.length));
  const pathText =
    typedCount > fullPrompt.length
      ? fullPath.slice(0, typedCount - fullPrompt.length)
      : '';

  useEffect(() => {
    document.title = 'David Bingmann';
  }, []);

  useEffect(() => {
    let hideTimer;
    const timer = setInterval(() => {
      setTypedCount((current) => {
        if (current >= totalLength) {
          return current;
        }
        return current + 1;
      });
    }, 150);

    return () => {
      clearInterval(timer);
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [totalLength]);

  useEffect(() => {
    if (typedCount === totalLength) {
      const timer = setTimeout(() => setHidePrompt(true), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [typedCount, totalLength]);

  useEffect(() => {
    if (promptText.length === fullPrompt.length && promptRef.current) {
      setPromptWidth(promptRef.current.getBoundingClientRect().width);
    }
  }, [promptText, fullPrompt.length]);

  return (
    <div className="home">
      <section
        className="hero"
        style={{ backgroundImage: `url(${profilePicture})` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-command">
            <span
              ref={promptRef}
              className={`prompt${hidePrompt ? ' prompt--hidden' : ''}`}
              style={{ '--prompt-width': promptWidth ? `${promptWidth}px` : undefined }}
            >
              {promptText}
            </span>
            <span className="path">{pathText}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">about/</h2>
        <div className="section-body">
          <p>
            My name is David Bingmann and I am currently studying Business
            Informatics &amp; Artificial Intelligence at the University of Trier.
          </p>
          <p>
            In addition to my studies, I work as a research assistant at the
            German Research Center for Artificial Intelligence (DFKI).
          </p>
          <p>
            Feel free to check out my social media channels or write me a{' '}
            <a href="mailto:contact@davidbingmann.de">mail</a>. I look forward to
            connecting!
          </p>
        </div>
      </section>
    </div>
  );
}
