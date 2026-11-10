import BackLink from '../components/BackLink.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Impressum() {
  useDocumentTitle('Imprint & Privacy');

  return (
    <>
      <BackLink />
      <div className="prose" translate="no">
        <h1 className="page-title">Imprint &amp; Privacy</h1>
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

        <h2>Image credits</h2>
        <p>
          The organization logos in the background section are trademarks of
          their respective owners: University of Trier, German Research Center
          for Artificial Intelligence (DFKI), Trier University of Applied
          Sciences, Tesla, Inc., and Staatliches Eifelgymnasium Neuerburg. They
          appear here only to identify the institutions named in the
          accompanying text and do not indicate any endorsement of, or
          affiliation with, this website. On a dark background some of them are
          shown in a single-color negative version, so that a mark drawn in
          dark ink stays visible. All other images on this site were created by
          me.
        </p>
        <p>
          If you hold rights to one of these marks and object to its use here,
          write to the address above and I will remove it.
        </p>

        <div className="fineprint">
          <h2 id="privacy">Privacy policy</h2>
          <p>
            This personal, non-commercial site sets no cookies and uses no
            third-party analytics, advertising, social plug-ins, or trackers.
            No web fonts are loaded; the site uses the fonts already installed
            on your device. The only statistics are the page counts this server
            keeps itself, described below. What little processing
            remains is based on Art. 6(1)(f) GDPR (legitimate interest in
            operating this website and knowing how much it is read).
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
            <strong>Server log files.</strong> This site writes no access log,
            so no IP addresses, User-Agents or requested URLs are stored by me.
            Apart from the page counts described below, requests are processed
            in memory and not recorded. The hosting
            provider may log at infrastructure level for operation and security
            under its own agreement; see below.
          </p>
          <p>
            <strong>Admin sign-in.</strong> The site has a sign-in page for its
            owner only. Every sign-in attempt there is recorded with its IP
            address, time and the user name tried, to detect and block password
            guessing (Art. 6(1)(f) GDPR). These records are deleted after 30
            days. Visitors who don't use the sign-in page are not affected.
          </p>
          <p>
            <strong>Page counts.</strong> When you open a page, the site's own
            script tells this server which page it was, and the server adds
            one to the counter for that page and day. Nothing else is
            recorded: no IP address, no browser details, nothing that could
            tell visitors apart or recognize you on a later visit. The request
            headers are only checked in memory to skip bots and browsers that
            send Do Not Track or Global Privacy Control; those views are not
            counted. The counts are kept for as long as this site runs, and
            only I can see them. Besides the count per day there is one per
            hour, which is deleted after two days.
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
    </>
  );
}
