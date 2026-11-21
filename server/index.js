require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const data = require('./data');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const get = (key) => (req, res) => res.json(data[key]);
app.get('/api/site', (req, res) =>
  res.json({ phone: data.phone, menu: data.menu, features: data.features, whyUs: data.whyUs, keyFeatures: data.keyFeatures })
);
app.get('/api/packages', get('packages'));
app.get('/api/gallery', get('gallery'));
app.get('/api/vehicles', get('vehicles'));
app.get('/api/tariff', get('tariff'));

// Pages and SEO blogs scraped from the original site (see scrape.py & scrape_blogs.py)
const SITE_URL = (process.env.SITE_URL || 'https://srtours.net').replace(/\/$/, '');
const pagesFile = path.join(__dirname, 'pages.json');
const blogsFile = path.join(__dirname, 'blogs.json');
const loadPages = () => (fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, 'utf8')) : {});
const loadBlogs = () => (fs.existsSync(blogsFile) ? JSON.parse(fs.readFileSync(blogsFile, 'utf8')) : []);

app.get('/api/blogs', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const area = String(req.query.area || '').trim().toLowerCase();
  let list = loadBlogs();
  if (area && area !== 'all') {
    list = list.filter((b) => (b.area || '').toLowerCase() === area);
  }
  if (q) {
    list = list.filter((b) =>
      `${b.title} ${b.area} ${b.excerpt} ${b.description}`.toLowerCase().includes(q)
    );
  }
  res.json(
    list.map(({ slug, title, area: a, date, excerpt, description, image }) => ({
      slug, title, area: a, date, excerpt, description, image,
    }))
  );
});

app.get('/api/layout', (req, res) => {
  const f = path.join(__dirname, 'layout.json');
  res.json(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { footerHtml: '', css: [] });
});
app.get('/api/pages', (req, res) =>
  res.json(Object.values(loadPages()).map(({ slug, title }) => ({ slug, title })))
);
app.get('/api/pages/:slug', (req, res) => {
  const slug = req.params.slug;
  const page = loadPages()[slug];
  if (page) return res.json(page);
  const blogs = loadBlogs();
  const blog = blogs.find((b) => b.slug === slug);
  if (blog) {
    const related = blogs
      .filter((b) => b.slug !== slug)
      .map(({ slug: s, title, area, image }) => ({ slug: s, title, area, image }));
    return res.json({ ...blog, type: 'blog', related });
  }
  return res.status(404).json({ error: 'Page not found' });
});

// Dynamic robots.txt and sitemap.xml for Google Search Console & area-wise SEO
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const pages = loadPages();
  const blogs = loadBlogs();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today, priority: '1.0', changefreq: 'weekly' },
  ];
  Object.keys(pages).forEach((slug) => {
    if (slug === 'home') return;
    urls.push({
      loc: `${SITE_URL}/${slug}`,
      lastmod: today,
      priority: slug === 'blogs' || slug === 'tariff' || slug === 'packages' ? '0.9' : '0.8',
      changefreq: 'weekly',
    });
  });
  blogs.forEach((b) => {
    urls.push({
      loc: `${SITE_URL}/${b.slug}`,
      lastmod: b.modified || b.date || today,
      priority: '0.85',
      changefreq: 'monthly',
    });
  });
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join('\n') +
    '\n</urlset>\n';
  res.type('application/xml').send(xml);
});

// Contact / enquiry form: saves to enquiries.json and sends email if SMTP is configured
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, subject, message } = req.body || {};
  if (!name || !(phone || email)) {
    return res.status(400).json({ error: 'Name and a phone or email are required.' });
  }

  const entry = {
    name: String(name).trim(),
    phone: String(phone || '').trim(),
    email: String(email || '').trim(),
    subject: String(subject || '').trim(),
    message: String(message || '').trim(),
    date: new Date().toISOString(),
  };

  const file = path.join(__dirname, 'enquiries.json');
  const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  list.push(entry);
  fs.writeFileSync(file, JSON.stringify(list, null, 2));

  let emailed = false;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"SR Tours Website" <${process.env.SMTP_USER}>`,
        to: process.env.MAIL_TO || 'srtravelsrajesh@gmail.com',
        replyTo: entry.email || undefined,
        subject: `New Enquiry from ${entry.name}${entry.subject ? ' - ' + entry.subject : ''}`,
        text: [
          `Name: ${entry.name}`,
          `Email: ${entry.email || 'N/A'}`,
          `Phone/Details: ${entry.phone || entry.subject || 'N/A'}`,
          `Message:\n${entry.message || 'N/A'}`,
          `\nSubmitted: ${entry.date}`,
        ].join('\n'),
      });
      emailed = true;
    } catch (err) {
      console.error('Mail send failed:', err.message);
      return res.status(500).json({
        error: 'Enquiry was saved, but email delivery failed. Please check SMTP settings in server/.env.',
      });
    }
  }

  res.json({
    ok: true,
    emailed,
    message: emailed
      ? 'Thank you! Your message has been emailed to SR Tours and we will contact you shortly.'
      : 'Thank you! Your enquiry has been received. We will contact you shortly.',
  });
});

// Serve the built React app in production with per-route SEO meta tags & JSON-LD
const dist = path.join(__dirname, '..', 'client', 'dist');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false }));
  app.get('*', (req, res) => {
    const indexFile = path.join(dist, 'index.html');
    let html = fs.readFileSync(indexFile, 'utf8');
    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    const slug = cleanPath || 'home';
    const pages = loadPages();
    const blogs = loadBlogs();
    const page = pages[slug];
    const blog = !page ? blogs.find((b) => b.slug === slug) : null;

    const title =
      (blog && blog.title) ||
      (slug === 'blogs'
        ? 'Area-Wise Travels in Chennai & Tour Blogs - SR Tours and Travels'
        : page && page.title) ||
      'SR Tours and Travels - Chennai Tour Packages & Car Rentals';
    const desc =
      (blog && blog.description) ||
      (slug === 'blogs'
        ? 'Explore SR Tours and Travels area-wise cab, van, and tour rental guides across Chennai including Madipakkam, Tambaram, Chrompet, Pallavaram, Pallikaranai, Medavakkam, Nanganallur, Perungalathur, and Vandalur.'
        : page && page.description) ||
      'SR Tours and Travels - temple tours, leisure tours, and 24/7 cab & van rentals across Chennai.';
    const canonical = cleanPath ? `${SITE_URL}/${cleanPath}` : `${SITE_URL}/`;
    const ogImage = (blog && blog.image ? `${SITE_URL}${blog.image}` : `${SITE_URL}/images/hero.jpg`);

    const localBusinessLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'SR Tours and Travels',
      url: SITE_URL,
      telephone: ['+91-9884300373', '+91-9884050506'],
      email: 'srtravelsrajesh@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'No. 1389, Mylai Balaji Nagar, 3rd Block, 1st Main Road, Madipakkam, Pallikaranai',
        addressLocality: 'Chennai',
        addressRegion: 'Tamil Nadu',
        postalCode: '600100',
        addressCountry: 'IN',
      },
      areaServed: ['Chennai', 'Madipakkam', 'Tambaram', 'Chrompet', 'Pallavaram', 'Pallikaranai', 'Medavakkam', 'Nanganallur', 'Perungalathur', 'Vandalur'],
    });

    const ldScripts =
      blog && blog.jsonLd && blog.jsonLd.length
        ? blog.jsonLd.map((j) => `<script type="application/ld+json">${j}</script>`).join('\n    ')
        : `<script type="application/ld+json">${localBusinessLd}</script>`;

    const seoTags = [
      `<link rel="canonical" href="${esc(canonical)}" />`,
      `<meta property="og:type" content="${blog ? 'article' : 'website'}" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(desc)}" />`,
      `<meta property="og:url" content="${esc(canonical)}" />`,
      `<meta property="og:image" content="${esc(ogImage)}" />`,
      ldScripts,
    ].join('\n    ');

    html = html
      .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
      .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(desc)}" />`)
      .replace('</head>', `    ${seoTags}\n  </head>`);

    res.send(html);
  });
}

app.listen(PORT, () => console.log(`SR Tours server running on http://localhost:${PORT}`));
