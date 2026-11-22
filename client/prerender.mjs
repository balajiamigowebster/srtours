import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const pagesDir = path.join(__dirname, 'public', 'data', 'pages');
const blogsFile = path.join(__dirname, 'public', 'data', 'blogs.json');
const SITE_URL = 'https://srtours.net';

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const blogs = fs.existsSync(blogsFile) ? JSON.parse(fs.readFileSync(blogsFile, 'utf8')) : [];

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
  areaServed: [
    'Chennai', 'Madipakkam', 'Pallikaranai', 'Medavakkam', 'Chrompet',
    'Tambaram', 'Pallavaram', 'Nanganallur', 'Perungalathur', 'Vandalur',
  ],
});

function renderHtml({ slug, title, description, ogImage, isBlog, jsonLd, bodyHtml }) {
  const canonical = slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${slug}`;
  const ldScripts =
    jsonLd && jsonLd.length
      ? [
          `<script type="application/ld+json">${localBusinessLd}</script>`,
          ...jsonLd.map((j) => `<script type="application/ld+json">${j}</script>`),
        ].join('\n    ')
      : `<script type="application/ld+json">${localBusinessLd}</script>`;

  const seoHead = [
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="SR Tours and Travels" />`,
    `<meta property="og:type" content="${isBlog ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    ldScripts,
  ].join('\n    ');

  let out = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${esc(description)}" />`
    )
    .replace('</head>', `    ${seoHead}\n  </head>`);

  if (bodyHtml) {
    out = out.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  }
  return out;
}

const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.json'));
let count = 0;

for (const file of files) {
  const pg = JSON.parse(fs.readFileSync(path.join(pagesDir, file), 'utf8'));
  const slug = pg.slug || file.replace(/\.json$/, '');
  const isBlog = pg.type === 'blog';

  let title = pg.title || 'SR Tours and Travels - Chennai Tour Packages & Car Rentals';
  let description =
    pg.description ||
    'SR Tours and Travels - temple tours, leisure tours, and 24/7 cab, van & tempo traveller rentals in Chennai.';
  let ogImage = pg.image ? `${SITE_URL}${pg.image}` : `${SITE_URL}/images/hero.jpg`;
  let bodyHtml = '';

  if (slug === 'home') {
    title = 'SR Tours and Travels - Best Travels, Tour Packages & Car Rentals in Chennai';
    description =
      'SR Tours and Travels in Chennai (Madipakkam & Pallikaranai) offers 24/7 cab rentals, temple tours, hill station packages, tempo travellers & airport transfers. Call +91 9884300373.';
    bodyHtml = `<h1>SR Tours and Travels - Tours &amp; Travels in Chennai</h1><p>${esc(description)}</p>`;
  } else if (slug === 'blogs') {
    title = 'Area-Wise Travels in Chennai & Tour Blogs - SR Tours and Travels';
    description =
      'Explore SR Tours and Travels area-wise cab, van, and tour rental guides across Chennai including Madipakkam, Pallikaranai, Medavakkam, Chrompet, Tambaram, Pallavaram, Nanganallur, Perungalathur, and Vandalur.';
    const links = blogs
      .map((b) => `<li><a href="/${esc(b.slug)}">${esc(b.title)}</a> - ${esc(b.description || b.excerpt)}</li>`)
      .join('');
    bodyHtml = `<main><h1>Travels in Chennai – Area-Wise Guides &amp; Blogs</h1><ul>${links}</ul></main>`;
  } else if (slug === 'tourdaily-destinations') {
    title = 'Destinations Gallery - SR Tours and Travels Chennai';
    description =
      'Explore South India temple tours, Ooty, Kodaikanal, Munnar, Yercaud, Mahabalipuram, and Pondicherry destination photos by SR Tours and Travels Chennai.';
    bodyHtml = `<main><h1>Destinations Gallery - SR Tours and Travels</h1><p>${esc(description)}</p></main>`;
  } else if (isBlog) {
    // Full SEO content directly in HTML for Googlebot
    bodyHtml = `<article><h1>${esc(title)}</h1>${pg.html || ''}</article>`;
  } else {
    const cleanTitle = title.replace(/\s*[-|–]\s*srtoursandtravels$/i, '').trim();
    title = `${cleanTitle} - SR Tours and Travels Chennai`;
    bodyHtml = `<main><h1>${esc(cleanTitle)}</h1><p>${esc(description)}</p></main>`;
  }

  const html = renderHtml({
    slug,
    title,
    description,
    ogImage,
    isBlog,
    jsonLd: pg.jsonLd || [],
    bodyHtml,
  });

  if (slug === 'home') {
    fs.writeFileSync(path.join(distDir, 'index.html'), html);
  } else {
    const outDir = path.join(distDir, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
  }
  count++;
}

console.log(`Pre-rendered SEO HTML for ${count} routes into client/dist/`);
