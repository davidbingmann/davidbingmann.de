import { useEffect } from 'react';

export default function Impressum() {
  useEffect(() => {
    document.title = 'Imprint & Privacy - David Bingmann';
  }, []);

  return (
    <section className="section">
      <h1 className="section-title">imprint/</h1>
      <div className="section-body" spellCheck={false}>
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

        <div className="legal-fineprint">
          <h2 id="privacy">Privacy policy</h2>
          <p>
            This personal, non-commercial site sets no cookies and uses no
            analytics, advertising, social plug-ins, or third-party trackers.
            Web fonts are bundled and served from the same domain. The
            processing described below is based on Art. 6(1)(f) GDPR
            (legitimate interest in operating and securing this website).
          </p>
          <p>
            <strong>Controller.</strong> See the imprint above.
          </p>
          <p>
            <strong>Hosting.</strong> This site is hosted by netcup GmbH,
            Daimlerstraße 25, 76185 Karlsruhe, Germany (server located in the
            EU). The provider acts as processor under Art. 28 GDPR.
          </p>
          <p>
            <strong>Server log files.</strong> Each HTTP request is recorded
            with your IP address, User-Agent, requested URL, response status,
            and timestamp. Logs are kept for a maximum of 14 days and then
            deleted. They are not merged with other data or used to identify
            individual visitors.
          </p>
          <p>
            <strong>Aggregate access statistics.</strong> A daily server-side
            report counts requests per day, broken down into humans, AI agents,
            and other bots based on the User-Agent. The report contains
            aggregate counts only; no profile is created and no data is shared
            with third parties.
          </p>
          <p>
            <strong>External links.</strong> Links to LinkedIn, GitHub, X
            (Twitter), and email addresses transmit data to the respective
            providers once you click them; their privacy policies apply.
          </p>
          <p>
            <strong>Your rights.</strong> Under Art. 15–18 and Art. 21 GDPR you
            may request information, correction, erasure or restriction of your
            personal data, and object to processing. Contact the email address
            in the imprint to exercise these rights.
          </p>
          <p>
            <strong>Complaints.</strong> You may lodge a complaint with the
            competent supervisory authority: Der Landesbeauftragte für den
            Datenschutz und die Informationsfreiheit Rheinland-Pfalz, Hintere
            Bleiche 34, 55116 Mainz —{' '}
            <a href="mailto:poststelle@datenschutz.rlp.de">
              poststelle@datenschutz.rlp.de
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
