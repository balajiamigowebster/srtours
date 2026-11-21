import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchJson } from '../api.js';

const loaded = new Map();

/** Append <link rel=stylesheet> tags once and resolve when they have loaded. */
export function ensureCss(list = []) {
  return Promise.all(
    list.map((href) => {
      if (loaded.has(href)) return loaded.get(href);
      const p = new Promise((resolve) => {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        l.onload = l.onerror = () => resolve();
        document.head.appendChild(l);
        setTimeout(resolve, 4000);
      });
      loaded.set(href, p);
      return p;
    })
  );
}

/** Renders original (cloned) HTML and routes internal links through React Router. */
export function Html({ html, className }) {
  const navigate = useNavigate();
  const onClick = (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href && href.startsWith('/') && !a.target) {
      e.preventDefault();
      navigate(href);
    }
  };
  // Original contact form -> our Node API
  const onSubmit = async (e) => {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    e.preventDefault();

    const first = form.querySelector('.wpforms-field-name-first')?.value?.trim() || '';
    const last = form.querySelector('.wpforms-field-name-last')?.value?.trim() || '';
    const email = form.querySelector('input[type="email"]')?.value?.trim() || '';
    const phoneInput = form.querySelector('input[type="tel"], input[name*="phone" i], input[name*="mobile" i]');
    const extraText = form.querySelector('.wpforms-field-text input[type="text"]')?.value?.trim() || '';
    const message = form.querySelector('textarea')?.value?.trim() || '';

    const body = {
      name: [first, last].filter(Boolean).join(' ') || 'Website visitor',
      email,
      phone: phoneInput?.value?.trim() || extraText,
      subject: extraText,
      message,
    };

    let statusEl = form.querySelector('.srt-form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'srt-form-status';
      form.appendChild(statusEl);
    }

    const btn = form.querySelector('button[type=submit],input[type=submit]');
    const origText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    }
    statusEl.className = 'srt-form-status sending';
    statusEl.textContent = 'Sending your message...';

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (r.ok) {
        statusEl.className = 'srt-form-status success';
        statusEl.textContent = j.message || 'Thank you! We will contact you shortly.';
        form.reset();
      } else {
        statusEl.className = 'srt-form-status error';
        statusEl.textContent = j.error || 'Could not send message. Please try again.';
      }
    } catch {
      statusEl.className = 'srt-form-status error';
      statusEl.textContent = 'Something went wrong. Please call us at +91 9884300373 / 9884050506.';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = origText;
    }
  };
  return <div className={className} onClick={onClick} onSubmit={onSubmit} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Page({ slug: slugProp, extra }) {
  const params = useParams();
  const slug = slugProp || params.slug || 'home';
  const [page, setPage] = useState(null);
  const [missing, setMissing] = useState(false);
  const token = useRef(0);

  useEffect(() => {
    const t = ++token.current;
    setMissing(false);
    fetchJson(`/api/pages/${slug}`, `/data/pages/${slug}.json`)
      .then(async (p) => {
        if (p.css && p.css.length) await ensureCss(p.css);
        if (t === token.current) {
          setPage(p);
          if (p.title) document.title = p.title;
          const meta = document.querySelector('meta[name="description"]');
          if (meta && p.description) meta.setAttribute('content', p.description);
        }
      })
      .catch(() => t === token.current && setMissing(true));
  }, [slug]);

  if (missing)
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2>Page not found</h2>
      </div>
    );
  if (!page || page.slug !== slug) return <div className="loading">Loading...</div>;

  if (page.type === 'blog') {
    return (
      <article className="srt-article">
        <div className="srt-wrap srt-article-wrap">
          <nav className="srt-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <Link to="/blogs">Blogs</Link> <span>/</span>{' '}
            <span>{page.area}</span>
          </nav>
          <span className="srt-area-badge inline">{page.area}</span>
          <h1>{page.title}</h1>
          {page.date && <div className="srt-blog-meta">Published: {page.date} · SR Tours &amp; Travels, Chennai</div>}
          {page.image && <img className="srt-article-banner" src={page.image} alt={page.title} />}
          <Html html={page.html} className="srt-article-content" />

          <div className="srt-article-cta">
            <div>
              <h3>Need a Cab, Van, or Tour Package in {page.area}?</h3>
              <p>24/7 doorstep pickup across {page.area} &amp; Chennai with transparent tariff and experienced drivers.</p>
            </div>
            <div className="srt-cta-actions">
              <a className="srt-btn primary" href="tel:+919884300373">
                <i className="fa-solid fa-phone" /> Call 9884300373
              </a>
              <Link className="srt-btn secondary" to="/contact">
                Book Online
              </Link>
            </div>
          </div>

          {page.related && page.related.length > 0 && (
            <section className="srt-related">
              <h2>Travels in Other Chennai Areas</h2>
              <div className="srt-related-grid">
                {page.related.map((r) => (
                  <Link key={r.slug} to={`/${r.slug}`} className="srt-related-link">
                    <span className="srt-related-area">{r.area}</span>
                    <span>{r.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    );
  }

  return (
    <>
      <Html html={page.html} className="orig-page" />
      {extra}
    </>
  );
}
