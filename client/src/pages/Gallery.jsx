import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PHOTOS = [
  { src: '/orig/assets/584f11779ea1.webp', title: 'Ooty Nilgiri Mountain Railway', category: 'Hill Stations', to: '/ooty-tour' },
  { src: '/orig/assets/7699ce796755.webp', title: 'Kodaikanal Lake & Hills', category: 'Hill Stations', to: '/kodaikanal-tours' },
  { src: '/orig/assets/14a906977dc4.webp', title: 'Yercaud Scenic Viewpoint', category: 'Hill Stations', to: '/yercaud-tour' },
  { src: '/orig/assets/2c93b611238c.jpeg', title: 'Mahabalipuram Shore Temple', category: 'Coastal & Heritage', to: '/mahabalipuram-tours' },
  { src: '/orig/assets/e84b2498f787.jpeg', title: 'Tirupati Balaji Temple', category: 'Temple Tours', to: '/tirupati-tours' },
  { src: '/orig/assets/e2ad6fd5b8ef.jpeg', title: 'Rameshwaram Temple', category: 'Temple Tours', to: '/south-india-temple-tour' },
  { src: '/orig/assets/52426e3bda0c.jpeg', title: 'Ooty Botanical Gardens', category: 'Hill Stations', to: '/ooty-tour' },
  { src: '/orig/assets/2e0c344b95fb.jpeg', title: 'Ooty Tea Estates', category: 'Hill Stations', to: '/ooty-tour' },
  { src: '/orig/assets/2ad8fc5016ba.jpeg', title: 'Munnar Misty Hills', category: 'Hill Stations', to: '/munnar-tour' },
  { src: '/orig/assets/15aeec96c523.jpeg', title: 'Kanchipuram Temple', category: 'Temple Tours', to: '/kanchipuram-tours' },
  { src: '/orig/assets/939b2e848366.jpeg', title: 'Tirupati Darshan', category: 'Temple Tours', to: '/tirupati-dharsan' },
  { src: '/orig/assets/b683a265e1e4.jpeg', title: 'Pondicherry French Quarter', category: 'Coastal & Heritage', to: '/pondicherry-tours' },
  { src: '/orig/assets/adb953b17cf3.jpeg', title: 'Mahabalipuram Heritage', category: 'Coastal & Heritage', to: '/mahabalipuram-tours' },
  { src: '/orig/assets/3406149acdb8.jpeg', title: 'Kodaikanal Pine Valley', category: 'Hill Stations', to: '/kodaikanal-tours' },
  { src: '/orig/assets/6e643af61598.jpg', title: 'South India Heritage Architecture', category: 'Temple Tours', to: '/temple-tours' },
];

const CATS = ['All', 'Hill Stations', 'Temple Tours', 'Coastal & Heritage'];

export default function Gallery() {
  const [cat, setCat] = useState('All');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const list = cat === 'All' ? PHOTOS : PHOTOS.filter((p) => p.category === cat);

  useEffect(() => {
    document.title = 'Destinations Gallery - SR Tours and Travels';
  }, []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % list.length);
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, list.length]);

  const active = lightboxIdx !== null ? list[lightboxIdx] : null;

  return (
    <section className="srt-gallery-page">
      <div className="srt-blogs-hero">
        <div className="srt-wrap">
          <h1>Destinations Gallery</h1>
          <p>Explore our most popular South India temple tours, misty hill stations, and coastal getaways.</p>
          <div className="srt-area-pills">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                className={`srt-pill ${cat === c ? 'active' : ''}`}
                onClick={() => {
                  setCat(c);
                  setLightboxIdx(null);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="srt-wrap srt-gallery-body">
        <div className="srt-gallery-grid">
          {list.map((p, idx) => (
            <figure
              className="srt-gallery-item"
              key={p.src + p.title}
              onClick={() => setLightboxIdx(idx)}
            >
              <img src={p.src} alt={p.title} loading="lazy" />
              <figcaption className="srt-gallery-caption">
                <span className="srt-gallery-cat">{p.category}</span>
                <strong>{p.title}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {active && (
        <div className="srt-lightbox" onClick={() => setLightboxIdx(null)} role="dialog" aria-modal="true">
          <div className="srt-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="srt-lb-close"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <button
              type="button"
              className="srt-lb-nav prev"
              onClick={() => setLightboxIdx((lightboxIdx - 1 + list.length) % list.length)}
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <img src={active.src} alt={active.title} />
            <button
              type="button"
              className="srt-lb-nav next"
              onClick={() => setLightboxIdx((lightboxIdx + 1) % list.length)}
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
            <div className="srt-lb-bar">
              <div>
                <span className="srt-gallery-cat">{active.category}</span>
                <h3>{active.title}</h3>
              </div>
              <Link className="srt-btn primary" to={active.to} onClick={() => setLightboxIdx(null)}>
                View Tour Package
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
