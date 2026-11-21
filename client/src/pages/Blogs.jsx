import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState('');
  const [activeArea, setActiveArea] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Area-Wise Travels in Chennai & Tour Blogs - SR Tours and Travels';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Explore SR Tours and Travels area-wise cab, van, and tour rental guides across Chennai including Madipakkam, Tambaram, Chrompet, Pallavaram, Pallikaranai, Medavakkam, Nanganallur, Perungalathur, and Vandalur.'
      );
    }
    fetch('/api/blogs')
      .then((r) => r.json())
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const areas = useMemo(() => {
    const uniq = Array.from(new Set(blogs.map((b) => b.area).filter(Boolean)));
    return ['All', ...uniq];
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter((b) => {
      const areaOk = activeArea === 'All' || b.area === activeArea;
      const qOk =
        !q ||
        `${b.title} ${b.area} ${b.excerpt} ${b.description}`.toLowerCase().includes(q);
      return areaOk && qOk;
    });
  }, [blogs, query, activeArea]);

  return (
    <section className="srt-blogs-page">
      <div className="srt-blogs-hero">
        <div className="srt-wrap">
          <h1>Travels in Chennai – Area-Wise Guides &amp; Blogs</h1>
          <p>
            Search cab, van, tempo traveller, and outstation tour rental guides for your area in Chennai.
          </p>
          <div className="srt-search-bar">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by area (e.g. Madipakkam, Tambaram, Chrompet, Vandalur)..."
              aria-label="Search travels by area"
            />
            {query && (
              <button type="button" className="srt-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
          <div className="srt-area-pills">
            {areas.map((a) => (
              <button
                key={a}
                type="button"
                className={`srt-pill ${activeArea === a ? 'active' : ''}`}
                onClick={() => setActiveArea(a)}
              >
                {a === 'All' ? `All Areas (${blogs.length})` : a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="srt-wrap srt-blogs-body">
        {loading ? (
          <div className="loading">Loading blogs...</div>
        ) : filtered.length === 0 ? (
          <div className="srt-empty">
            <p>No area guides matched &ldquo;{query}&rdquo;. Try another Chennai locality or call +91 9884300373.</p>
          </div>
        ) : (
          <div className="srt-blog-grid">
            {filtered.map((b) => (
              <article className="srt-blog-card" key={b.slug}>
                <Link to={`/${b.slug}`} className="srt-blog-thumb">
                  {b.image && <img src={b.image} alt={b.title} loading="lazy" />}
                  <span className="srt-area-badge">{b.area}</span>
                </Link>
                <div className="srt-blog-card-body">
                  {b.date && <div className="srt-blog-meta">{b.date}</div>}
                  <h2>
                    <Link to={`/${b.slug}`}>{b.title}</Link>
                  </h2>
                  <p>{b.description || b.excerpt}</p>
                  <Link to={`/${b.slug}`} className="srt-read-more">
                    Read Full Guide <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
