import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Html, ensureCss } from '../pages/Page.jsx';

const SEO_LINKS = [
  { to: '/car-rental-in-chennai', label: 'Car Rental in Chennai' },
  { to: '/chennai-tour-packages', label: 'Chennai Tour Packages' },
  { to: '/rameswaram-tour-packages', label: 'Rameswaram Tour Packages' },
  { to: '/travels-in-chennai', label: 'Travels in Chennai' },
  { to: '/travels-in-madipakkam', label: 'Travels in Madipakkam' },
  { to: '/travels-in-pallikaranai', label: 'Travels in Pallikaranai' },
  { to: '/travels-in-medavakkam', label: 'Travels in Medavakkam' },
  { to: '/travels-in-chrompet', label: 'Travels in Chrompet' },
  { to: '/travels-in-tambaram', label: 'Travels in Tambaram' },
  { to: '/travels-in-pallavaram', label: 'Travels in Pallavaram' },
  { to: '/travels-in-nanganallur', label: 'Travels in Nanganallur' },
  { to: '/travels-in-perungalathur', label: 'Travels in Perungalathur' },
  { to: '/travels-in-vandalur', label: 'Travels in Vandalur' },
  { to: '/best-travels-in-chennai-rental-guide', label: 'Best Travels in Chennai Guide' },
];

export default function Footer({ layout }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureCss(layout.css).then(() => setReady(true));
  }, [layout]);
  if (!ready) return null;
  return (
    <>
      <section className="srt-seo-strip" aria-label="Popular Chennai Travel Services and Areas">
        <div className="srt-wrap">
          <h3>Popular Services &amp; Service Areas in Chennai</h3>
          <div className="srt-seo-links">
            {SEO_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Html html={layout.footerHtml} className="orig-footer" />
    </>
  );
}
