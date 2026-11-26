import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../api.js';
import Loader from '../components/Loader.jsx';

const PAGE_SIZE = 10;

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState('');
  const [activeArea, setActiveArea] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
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
    fetchJson('/api/blogs', '/data/blogs.json')
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Reset to page 1 whenever search query or area filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeArea]);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // Slice exactly 10 blogs for the active page
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

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
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="srt-empty">
            <p>No area guides matched &ldquo;{query}&rdquo;. Try another Chennai locality or call +91 9884300373.</p>
          </div>
        ) : (
          <>
            <div className="srt-blog-grid">
              {paginatedBlogs.map((b) => (
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

            {/* Pagination Controls with Left & Right Arrows */}
            {totalPages > 1 && (
              <nav className="srt-pagination" aria-label="Blog pagination">
                <button
                  type="button"
                  className="srt-page-btn srt-page-arrow"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>

                <div className="srt-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`srt-page-btn ${num === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="srt-page-btn srt-page-arrow"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
