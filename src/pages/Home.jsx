import { useEffect, useState } from 'react';
import profilePicture800 from '../assets/profile_picture_800.jpeg';
import profilePicture1200 from '../assets/profile_picture_1200.jpeg';
import profilePictureFull from '../assets/profile_picture.jpeg';

const COMMAND_CD = 'cd davidbingmann/.';
const COMMAND_CAT = 'cat about.txt';
const TYPE_INTERVAL = 90;

const STAGE = {
  TYPING_CD: 0,
  PROFILE: 1,
  TYPING_CAT: 2,
  ABOUT: 3,
  DONE: 4,
};

// Module-level so the intro only plays on the first visit per page load,
// not every time the user navigates back to home via the tabs.
let introPlayed = false;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

function useTerminalTimeline(instant) {
  const [stage, setStage] = useState(instant ? STAGE.DONE : STAGE.TYPING_CD);
  const [typedCd, setTypedCd] = useState(instant ? COMMAND_CD.length : 0);
  const [typedCat, setTypedCat] = useState(instant ? COMMAND_CAT.length : 0);

  useEffect(() => {
    if (instant) {
      setStage(STAGE.DONE);
      setTypedCd(COMMAND_CD.length);
      setTypedCat(COMMAND_CAT.length);
      return undefined;
    }

    let delay;
    let action;

    if (stage === STAGE.TYPING_CD && typedCd < COMMAND_CD.length) {
      delay = TYPE_INTERVAL;
      action = () => setTypedCd((count) => count + 1);
    } else if (stage === STAGE.TYPING_CD) {
      delay = 400;
      action = () => setStage(STAGE.PROFILE);
    } else if (stage === STAGE.PROFILE) {
      delay = 900;
      action = () => setStage(STAGE.TYPING_CAT);
    } else if (stage === STAGE.TYPING_CAT && typedCat < COMMAND_CAT.length) {
      delay = TYPE_INTERVAL;
      action = () => setTypedCat((count) => count + 1);
    } else if (stage === STAGE.TYPING_CAT) {
      delay = 400;
      action = () => setStage(STAGE.ABOUT);
    } else if (stage === STAGE.ABOUT) {
      delay = 500;
      action = () => setStage(STAGE.DONE);
    } else {
      return undefined;
    }

    const timer = setTimeout(action, delay);
    return () => clearTimeout(timer);
  }, [instant, stage, typedCd, typedCat]);

  return { stage, typedCd, typedCat };
}

function Reveal({ open, children }) {
  return (
    <div className={`terminal-reveal${open ? ' terminal-reveal--open' : ''}`}>
      <div className="terminal-reveal-inner">{children}</div>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [skipIntro] = useState(() => introPlayed);
  const { stage, typedCd, typedCat } = useTerminalTimeline(
    reduceMotion || skipIntro
  );

  useEffect(() => {
    introPlayed = true;
    document.title = 'David Bingmann';
  }, []);

  return (
    <div className="home">
      <section className="terminal" aria-label="About David Bingmann">
        <div className="terminal-bar">
          <span className="terminal-dot terminal-dot--close" />
          <span className="terminal-dot terminal-dot--minimize" />
          <span className="terminal-dot terminal-dot--zoom" />
          <span className="terminal-title">david@bingmann.de — zsh</span>
        </div>
        <div className="terminal-body">
          <p className="terminal-line">
            <span className="terminal-cwd">~</span>{' '}
            <span className="terminal-dollar">$</span>{' '}
            {COMMAND_CD.slice(0, typedCd)}
            {stage === STAGE.TYPING_CD && <span className="terminal-cursor" />}
          </p>

          <Reveal open={stage >= STAGE.PROFILE}>
            <div className="terminal-profile">
              <img
                className="terminal-photo"
                src={profilePicture1200}
                srcSet={`${profilePicture800} 533w, ${profilePicture1200} 800w, ${profilePictureFull} 1000w`}
                sizes="(max-width: 720px) 64vw, 220px"
                alt="Portrait of David Bingmann"
                decoding="async"
                fetchPriority="high"
              />
              <div className="terminal-facts">
                <p className="terminal-name">David Bingmann</p>
                <p className="terminal-role">Bachelor&rsquo;s student</p>
                <hr className="terminal-rule" />
                <p className="terminal-fact">
                  <span className="terminal-key">Study</span>
                  Business Informatics &amp; AI
                </p>
                <p className="terminal-fact">
                  <span className="terminal-key">Uni</span>
                  University of Trier
                </p>
                <p className="terminal-fact">
                  <span className="terminal-key">Work</span>
                  Research assistant @ DFKI
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal open={stage >= STAGE.TYPING_CAT}>
            <p className="terminal-line">
              <span className="terminal-cwd">~/davidbingmann</span>{' '}
              <span className="terminal-dollar">$</span>{' '}
              {COMMAND_CAT.slice(0, typedCat)}
              {stage === STAGE.TYPING_CAT && (
                <span className="terminal-cursor" />
              )}
            </p>
          </Reveal>

          <Reveal open={stage >= STAGE.ABOUT}>
            <p className="terminal-about">
              My name is David Bingmann and I am currently studying Business
              Informatics &amp; Artificial Intelligence at the University of
              Trier. In addition to my studies, I work as a research assistant
              at the German Research Center for Artificial Intelligence (DFKI).
              Feel free to check out my social media channels or write me a{' '}
              <a href="mailto:contact@davidbingmann.de">mail</a> &mdash; I look
              forward to connecting!
            </p>
          </Reveal>

          <Reveal open={stage >= STAGE.DONE}>
            <p className="terminal-line">
              <span className="terminal-cwd">~/davidbingmann</span>{' '}
              <span className="terminal-dollar">$</span>{' '}
              <span className="terminal-cursor terminal-cursor--blink" />
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
