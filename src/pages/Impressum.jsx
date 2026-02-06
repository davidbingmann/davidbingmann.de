import { useEffect } from 'react';

export default function Impressum() {
  useEffect(() => {
    document.title = 'Impressum - David Bingmann';
  }, []);

  return (
    <section className="section">
      <h1 className="section-title">impressum/</h1>
      <div className="section-body">
        <p>
          <strong>Information according to §§ 5, 6 DDG</strong>
        </p>

        <p>
          <strong>Website owner:</strong> David Bingmann
          <br />
          <strong>Address:</strong> Kaiserstraße 36A, 54290 Trier, Germany
          <br />
          <strong>Email:</strong>{' '}
          <a href="mailto:contact@davidbingmann.de">contact@davidbingmann.de</a>
        </p>

        <h2>Responsibility for content</h2>
        <p>
          As the website owner, I am responsible for my own content on these pages
          in accordance with general laws. However, I am not obliged to monitor
          transmitted or stored third-party information or to investigate
          circumstances that indicate unlawful activity.
        </p>
        <p>
          Obligations to remove or block the use of information remain unaffected.
          Liability in this regard is only possible from the point in time at
          which a specific infringement becomes known. If I become aware of such
          legal violations, I will remove the affected content immediately.
        </p>

        <h2>Liability for links</h2>
        <p>
          This website contains links to external third-party websites. I have no
          influence over the content of those websites and therefore cannot assume
          any liability for such external content. The respective provider or
          operator of the linked pages is always responsible for their content.
        </p>
        <p>
          The linked pages were checked for possible legal violations at the time
          of linking. Unlawful content was not identifiable at that time. Permanent
          monitoring of the content of linked pages is not reasonable without
          concrete evidence of a violation. If I become aware of legal violations,
          I will remove such links immediately.
        </p>

        <h2>Copyright</h2>
        <p>
          The content and works created by me on these pages are subject to German
          copyright law. Any duplication, processing, distribution, or any form of
          exploitation beyond the limits of copyright law requires the prior
          written consent of the respective author or creator.
        </p>
        <p>
          Downloads and copies of this website are only permitted for private,
          non-commercial use. Insofar as the content on this site was not created
          by me, the copyrights of third parties are respected and such content is
          marked accordingly. If you nevertheless become aware of a copyright
          infringement, please let me know so that I can remove the affected
          content immediately.
        </p>
      </div>
    </section>
  );
}

