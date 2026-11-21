#!/usr/bin/env python3
"""
Fetch all WordPress blog posts (area-wise SEO articles) from srtours.net,
download their featured & inline images locally, extract meta descriptions &
JSON-LD schema, and also enrich existing pages in server/pages.json with
their original meta descriptions.
"""
import os, re, json, hashlib, html as htmllib, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSET_DIR = os.path.join(ROOT, 'client', 'public', 'orig', 'assets')
CACHE = '/tmp/srt_cache'
os.makedirs(ASSET_DIR, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0'}
SITE = 'https://srtours.net'

def md5(s): return hashlib.md5(s.encode()).hexdigest()[:12]

def fetch(url, binary=False, retries=3):
    for _ in range(retries):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45).read()
            return data if binary else data.decode('utf8', 'ignore')
        except Exception as e:
            err = e
    raise err

def page_html(url):
    f = os.path.join(CACHE, md5(url) + '.html')
    if os.path.exists(f):
        return open(f, encoding='utf8').read()
    h = fetch(url)
    open(f, 'w', encoding='utf8').write(h)
    return h

def local_asset(url):
    url = htmllib.unescape(url or '').strip().strip('\'"')
    if not url or url.startswith('data:') or url.startswith('/'):
        return url
    url = urllib.parse.urljoin(SITE + '/', url).split('#')[0]
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or '.jpg'
    name = md5(url) + ext
    path = os.path.join(ASSET_DIR, name)
    if not os.path.exists(path):
        try:
            open(path, 'wb').write(fetch(url, True))
        except Exception as e:
            print('  img fail:', url, e)
            return url
    return '/orig/assets/' + name

def rewrite_html(frag):
    def img(m):
        tag = m.group(0)
        a = dict((k.lower(), v) for k, v in re.findall(r'([\w:-]+)=["\']([^"\']*)["\']', tag))
        src = a.get('data-src') or a.get('data-lazy-src') or a.get('src') or ''
        if not src or src.startswith('data:'):
            return ''
        parts = ['src="%s"' % local_asset(src)]
        for k in ('class', 'alt', 'width', 'height'):
            if k in a:
                parts.append('%s="%s"' % (k, a[k]))
        return '<img %s loading="lazy" />' % ' '.join(parts)
    frag = re.sub(r'<img\b[^>]*>', img, frag)

    def link(m):
        u = htmllib.unescape(m.group(1))
        p = urllib.parse.urlparse(u)
        if p.netloc in ('srtours.net', 'www.srtours.net'):
            path = p.path.replace('/index.php', '').rstrip('/') or '/'
            return 'href="%s"' % path
        return m.group(0)
    frag = re.sub(r'href="([^"]*)"', link, frag)
    # Remove target="_blank" on internal links so React Router handles them smoothly
    frag = re.sub(r'(<a[^>]+href="/[^"]*"[^>]*?)\s+target="_blank"', r'\1', frag)
    return frag

def extract_meta_desc(h):
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', h, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', h, re.I)
    return htmllib.unescape(m.group(1)).strip() if m else ''

def extract_jsonld(h):
    blocks = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', h, re.S | re.I)
    return [b.strip() for b in blocks if b.strip()]

def infer_area(slug, title):
    m = re.match(r'^travels-in-([a-z0-9-]+)$', slug)
    if m:
        return m.group(1).replace('-', ' ').title()
    if 'chennai' in slug:
        return 'Chennai'
    return 'Chennai'

print('Fetching WP posts...')
posts = json.loads(fetch(SITE + '/wp-json/wp/v2/posts?per_page=100&_embed'))
print(f'Found {len(posts)} blog posts')

# Prefetch post HTML pages in parallel for meta descriptions & JSON-LD
with ThreadPoolExecutor(6) as ex:
    list(ex.map(lambda p: page_html(p['link']), posts))

blogs = []
for p in posts:
    slug = p['slug']
    title = htmllib.unescape(p['title']['rendered']).strip()
    excerpt_raw = re.sub(r'<[^>]+>', '', htmllib.unescape(p['excerpt']['rendered'])).strip()
    excerpt = re.sub(r'\s+', ' ', excerpt_raw)
    emb = p.get('_embedded', {})
    feat = emb.get('wp:featuredmedia', [{}])[0].get('source_url', '') if emb.get('wp:featuredmedia') else ''
    image = local_asset(feat) if feat else ''
    content_html = rewrite_html(p['content']['rendered'])
    raw_html = page_html(p['link'])
    meta_desc = extract_meta_desc(raw_html) or excerpt[:155]
    jsonld = extract_jsonld(raw_html)
    area = infer_area(slug, title)
    blogs.append({
        'slug': slug,
        'title': title,
        'area': area,
        'date': p.get('date', '')[:10],
        'modified': p.get('modified', '')[:10],
        'excerpt': excerpt,
        'description': meta_desc,
        'image': image,
        'html': content_html,
        'jsonLd': jsonld,
    })
    print(f'  blog: {slug} | area={area} | desc={len(meta_desc)} | img={bool(image)}')

json.dump(blogs, open(os.path.join(ROOT, 'server', 'blogs.json'), 'w'), indent=1, ensure_ascii=False)

# Enrich existing pages in server/pages.json with meta descriptions from cached HTML
pages_path = os.path.join(ROOT, 'server', 'pages.json')
pages = json.load(open(pages_path, encoding='utf8'))
for slug, pg in pages.items():
    url = pg.get('url')
    if url:
        f = os.path.join(CACHE, md5(url) + '.html')
        if os.path.exists(f):
            h = open(f, encoding='utf8').read()
            desc = extract_meta_desc(h)
            if desc:
                pg['description'] = desc
json.dump(pages, open(pages_path, 'w'), ensure_ascii=False)
print('Saved server/blogs.json and enriched server/pages.json')
