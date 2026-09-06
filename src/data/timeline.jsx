// Newest first. `year` is the anchor numeral, `until` the small label under it
// (omit for a single-year entry). `logo` holds the organisation's mark; the
// column is a fixed width, so an entry without one leaves an empty tile slot.
// Adding a logo here also means adding the owner to the trademark list in
// src/pages/Impressum.jsx.
//
// Logo files are pre-trimmed to the mark itself, so each one fills the square
// box to the same degree instead of floating in whatever margin its source
// shipped with. Eifelgymnasium is the crest without its wordmark and
// Hochschule Trier the stacked block without its strapline, Trier the shield
// without its wordmark — every name is spelled out in the entry text next to
// the logo anyway.
import ExternalLink from '../components/ExternalLink.jsx';
import dfkiLogo from '../assets/logos/dfki.webp';
import eifelgymnasiumLogo from '../assets/logos/eifelgymnasium.webp';
import hsTrierLogo from '../assets/logos/hs-trier.webp';
import teslaLogo from '../assets/logos/tesla.webp';
import uniTrierLogo from '../assets/logos/uni-trier.webp';
export const timelineItems = [
  {
    year: '2025',
    until: 'to present',
    logo: { src: uniTrierLogo, alt: 'University of Trier' },
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
    logo: { src: dfkiLogo, alt: 'DFKI' },
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
    logo: { src: hsTrierLogo, alt: 'University of Applied Sciences Trier' },
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
    logo: { src: teslaLogo, alt: 'Tesla' },
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
    logo: { src: eifelgymnasiumLogo, alt: 'Staatliches Eifelgymnasium Neuerburg' },
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
