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
    `<meta name="keywords" content="car rental in chennai, chennai tour packages, Rameswaram tour packages, travels in chennai, travels in madipakkam, travels in pallikaranai, tempo traveller chennai, SR Tours and Travels" />`,
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
    title = 'SR Tours and Travels - Car Rental in Chennai, Chennai Tour Packages & Rameswaram Tour Packages';
    description =
      'Book affordable car rental in Chennai, customized Chennai tour packages, and Rameswaram tour packages with SR Tours & Travels. 24/7 AC cabs, Innova Crysta, tempo travellers & airport transfers. Call +91 9884300373.';
    bodyHtml = `<h1>SR Tours and Travels – Car Rental in Chennai &amp; Chennai Tour Packages</h1><p>${esc(description)}</p><p><a href="/car-rental-in-chennai">Car Rental in Chennai</a> | <a href="/chennai-tour-packages">Chennai Tour Packages</a> | <a href="/rameswaram-tour-packages">Rameswaram Tour Packages</a></p>`;
  } else if (slug === 'tariff') {
    title = 'Car Rental in Chennai Tariff – AC Cab, Innova & Tempo Traveller Rates | SR Tours';
    description =
      'Transparent car rental in Chennai tariff from SR Tours & Travels. Check hourly, local & outstation rates for Swift Dzire, Etios, Innova Crysta, Hycross, Fortuner, Tempo Traveller & Mini Bus.';
    bodyHtml = `<main><h1>Car Rental in Chennai – Tariff &amp; Rates</h1><p>${esc(description)}</p></main>`;
  } else if (slug === 'vehicle') {
    title = 'Car Rental in Chennai Fleet – Sedans, SUVs, Innova & Tempo Travellers | SR Tours';
    description =
      'Explore our AC car rental in Chennai fleet: Swift Dzire, Toyota Etios, Innova Crysta, Hycross, Tempo Travellers & Mini Buses for local, airport & outstation travel.';
    bodyHtml = `<main><h1>Car Rental in Chennai – Our Fleet</h1><p>${esc(description)}</p></main>`;
  } else if (slug === 'packages') {
    title = 'Chennai Tour Packages & Rameswaram Tour Packages | SR Tours and Travels';
    description =
      'Book customized Chennai tour packages, Rameswaram tour packages, Tirupati darshan, Mahabalipuram, Ooty & Kodaikanal tours in AC vehicles with SR Tours & Travels.';
    bodyHtml = `<main><h1>Chennai Tour Packages &amp; Rameswaram Tour Packages</h1><p>${esc(description)}</p></main>`;
  } else if (slug === 'south-india-temple-tour') {
    title = 'Rameswaram Tour Packages & South India Temple Tour from Chennai | SR Tours';
    description =
      'Book 2-day & 3-day Rameswaram tour packages and South India temple tours from Chennai covering Ramanathaswamy Temple, Madurai, Thiruchendur & Kanyakumari.';
    bodyHtml = `<main><h1>Rameswaram Tour Packages &amp; South India Temple Tour</h1><p>${esc(description)}</p></main>`;
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
