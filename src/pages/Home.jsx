import { useEffect, useRef, useState } from 'react';
import profilePicture800 from '../assets/profile_picture_800.jpeg';
import profilePicture1200 from '../assets/profile_picture_1200.jpeg';
import profilePicture2000 from '../assets/profile_picture_2000.jpeg';

export default function Home() {
  const fullPrompt = '~ cd';
  const fullPath = 'davidbingmann/.';
  const totalLength = fullPrompt.length + fullPath.length;

  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches
  );
  const disableHeroAnimation = reduceMotion || isSmallScreen;

  const [typedCount, setTypedCount] = useState(() =>
    disableHeroAnimation ? totalLength : 0
  );
  const [hidePrompt, setHidePrompt] = useState(() => disableHeroAnimation);
  const promptRef = useRef(null);
  const [promptWidth, setPromptWidth] = useState(0);

  const promptText = fullPrompt.slice(0, Math.min(typedCount, fullPrompt.length));
  const pathText =
    typedCount > fullPrompt.length
      ? fullPath.slice(0, typedCount - fullPrompt.length)
      : '';

  useEffect(() => {
    document.title = 'David Bingmann';
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event) => setReduceMotion(event.matches);

    setReduceMotion(motionQuery.matches);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
      return () => motionQuery.removeEventListener('change', handleMotionChange);
    }

    motionQuery.addListener(handleMotionChange);
    return () => motionQuery.removeListener(handleMotionChange);
  }, []);

  useEffect(() => {
    const screenQuery = window.matchMedia('(max-width: 720px)');
    const handleScreenChange = (event) => setIsSmallScreen(event.matches);

    setIsSmallScreen(screenQuery.matches);
    if (screenQuery.addEventListener) {
      screenQuery.addEventListener('change', handleScreenChange);
      return () => screenQuery.removeEventListener('change', handleScreenChange);
    }

    screenQuery.addListener(handleScreenChange);
    return () => screenQuery.removeListener(handleScreenChange);
  }, []);

  useEffect(() => {
    if (disableHeroAnimation) {
      setTypedCount(totalLength);
      setHidePrompt(true);
      return undefined;
    }

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
    };
  }, [disableHeroAnimation, totalLength]);

  useEffect(() => {
    if (disableHeroAnimation) {
      return undefined;
    }

    if (typedCount === totalLength) {
      const timer = setTimeout(() => setHidePrompt(true), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [disableHeroAnimation, typedCount, totalLength]);

  useEffect(() => {
    if (disableHeroAnimation) {
      return undefined;
    }

    if (promptText.length === fullPrompt.length && promptRef.current) {
      setPromptWidth(promptRef.current.getBoundingClientRect().width);
    }
    return undefined;
  }, [disableHeroAnimation, promptText, fullPrompt.length]);

  return (
    <div className="home">
      <section className="hero">
        <img
          className="hero-image"
          src={profilePicture1200}
          srcSet={`${profilePicture800} 722w, ${profilePicture1200} 1083w, ${profilePicture2000} 1806w`}
          sizes="(max-width: 900px) calc(100vw - 2rem), 852px"
          alt="Portrait of David Bingmann"
          decoding="async"
          fetchPriority="high"
        />
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
          <div className="hero-tagline">Bachelor&rsquo;s student</div>
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
