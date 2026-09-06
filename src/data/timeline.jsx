// Newest first. `year` is the anchor numeral, `until` the small label under it
// (omit for a single-year entry). `logo` holds the organisation's mark; the
// column is a fixed width, so an entry without one leaves an empty tile slot.
// Adding a logo takes four steps: crop the file down to the mark itself and
// save it as WebP at roughly 200px in ../assets/logos, give it a mode in
// MODES in scripts/make_dark_logos.py and run that, import both files and set
// `logo: { src, dark, alt }` below, and add the owner to the trademark list in
// src/pages/Impressum.jsx.
//
// Logo files are pre-trimmed to the mark itself, so each one fills the square
// box to the same degree instead of floating in whatever margin its source
// shipped with. Eifelgymnasium is the crest without its wordmark and
// Hochschule Trier the stacked block without its strapline, Trier the shield
// without its wordmark — every name is spelled out in the entry text next to
// the logo anyway.
//
// Each mark comes twice. The plain file is ink on an opaque white rectangle,
// which is what the light page wants; the -dark file is the same mark cut out
// of that rectangle. scripts/make_dark_logos.py derives the second set from
// the first and explains what it does to each mark.
import ExternalLink from '../components/ExternalLink.jsx';
import dfkiLogo from '../assets/logos/dfki.webp';
import dfkiLogoDark from '../assets/logos/dfki-dark.webp';
import eifelgymnasiumLogo from '../assets/logos/eifelgymnasium.webp';
import eifelgymnasiumLogoDark from '../assets/logos/eifelgymnasium-dark.webp';
import hsTrierLogo from '../assets/logos/hs-trier.webp';
import hsTrierLogoDark from '../assets/logos/hs-trier-dark.webp';
import teslaLogo from '../assets/logos/tesla.webp';
import teslaLogoDark from '../assets/logos/tesla-dark.webp';
import uniTrierLogo from '../assets/logos/uni-trier.webp';
import uniTrierLogoDark from '../assets/logos/uni-trier-dark.webp';
export const timelineItems = [
  {
    year: '2025',
    until: 'to present',
    logo: { src: uniTrierLogo, dark: uniTrierLogoDark, alt: 'University of Trier' },
    body: (
      <>
        I study Business Informatics &amp; Artificial Intelligence (B.Sc.) at the{' '}
        <ExternalLink href="https://www.uni-trier.de/">University of Trier</ExternalLink>. It is also
        where I wrote my seminar paper on humanoid robots in Industry 5.0, which
        you can find under publications below.
      </>
    ),
  },
  {
    year: '2024',
    until: 'to present',
    logo: { src: dfkiLogo, dark: dfkiLogoDark, alt: 'DFKI' },
    body: (
      <>
        Alongside my studies I work as a research assistant at the{' '}
        <ExternalLink href="https://www.dfki.de/">
          German Research Center for Artificial Intelligence (DFKI)
        </ExternalLink>
        .
      </>
    ),
  },
  {
    year: '2024',
    until: 'to 2025',
    logo: {
      src: hsTrierLogo,
      dark: hsTrierLogoDark,
      alt: 'University of Applied Sciences Trier',
    },
    body: (
      <>
        I started out in Artificial Intelligence &amp; Data Science (B.Sc.) at
        the{' '}
        <ExternalLink href="https://www.hochschule-trier.de/">
          University of Applied Sciences Trier
        </ExternalLink>{' '}
        before moving over to the University of Trier.
      </>
    ),
  },
  {
    year: '2024',
    logo: { src: teslaLogo, dark: teslaLogoDark, alt: 'Tesla' },
    body: (
      <>
        I interned in Controls Engineering at{' '}
        <ExternalLink href="https://teslaautomation.de/en/">
          Tesla Automation
        </ExternalLink>
        .
      </>
    ),
  },
  {
    year: '2024',
    logo: {
      src: eifelgymnasiumLogo,
      dark: eifelgymnasiumLogoDark,
      alt: 'Staatliches Eifelgymnasium Neuerburg',
    },
    body: (
      <>
        Abitur at{' '}
        <ExternalLink href="https://www.eifel-gymnasium.de/">
          Staatliches Eifelgymnasium Neuerburg
        </ExternalLink>
        .
      </>
    ),
  },
];
