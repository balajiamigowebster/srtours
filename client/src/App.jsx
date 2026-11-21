import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Page from './pages/Page.jsx';
import Blogs from './pages/Blogs.jsx';
import { fetchJson } from './api.js';

export default function App() {
  const [site, setSite] = useState(null);
  const [layout, setLayout] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    fetchJson('/api/site', '/data/site.json').then(setSite).catch(console.error);
    fetchJson('/api/layout', '/data/layout.json').then(setLayout).catch(console.error);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!site) return <div className="loading">Loading...</div>;

  return (
    <>
      <Header site={site} />
      <main>
        <Routes>
          <Route path="/" element={<Page slug="home" />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/:slug" element={<Page />} />
        </Routes>
      </main>
      {layout && <Footer layout={layout} />}
      <span className="whatsapp-label">Contact us</span>
      <a className="whatsapp" href={`https://wa.me/91${site.phone[1]}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <i className="fa-brands fa-whatsapp" />
      </a>
    </>
  );
}
