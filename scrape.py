#!/usr/bin/env python3
"""
Faithful clone of srtours.net pages.

For every page it stores the original Elementor main-content HTML (with images
localised and links rewritten) plus the original CSS files (localised) so the
React app can render pixel-faithful copies.

Output:
  server/pages.json   {slug: {slug,title,html,css:[...]}}
  server/layout.json  {footerHtml, css:[...]}
  client/public/orig/{css,assets}/...
"""
import re, json, os, hashlib, html as htmllib, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(ROOT, 'client', 'public', 'orig')
CSS_DIR = os.path.join(PUB, 'css'); ASSET_DIR = os.path.join(PUB, 'assets')
CACHE = '/tmp/srt_cache'
for d in (CSS_DIR, ASSET_DIR, CACHE): os.makedirs(d, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0'}
SITE = 'https://srtours.net'

def fetch(url, binary=False, retries=3):
    for n in range(retries):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            return data if binary else data.decode('utf8', 'ignore')
        except Exception as e:
            err = e
    raise err

def md5(s): return hashlib.md5(s.encode()).hexdigest()[:12]

def page_html(url):
    f = os.path.join(CACHE, md5(url) + '.html')
    if os.path.exists(f): return open(f, encoding='utf8').read()
    h = fetch(url); open(f, 'w', encoding='utf8').write(h); return h

_asset_cache = {}
def local_asset(url, base=SITE + '/'):
    url = htmllib.unescape(url).strip().strip('\'"')
    if url.startswith('data:') or not url or url.startswith('/images/') or url.startswith('/orig/'): return url
    url = urllib.parse.urljoin(base, url)
    url = url.split('#')[0]
    if url in _asset_cache: return _asset_cache[url]
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or '.bin'
    name = md5(url) + ext
    path = os.path.join(ASSET_DIR, name)
    if not os.path.exists(path):
        try: open(path, 'wb').write(fetch(url, True))
        except Exception as e:
            print('  asset fail', url, e); _asset_cache[url] = url; return url
    _asset_cache[url] = '/orig/assets/' + name
    return _asset_cache[url]

_css_cache = {}
def local_css(url):
    url = htmllib.unescape(url)
    if url in _css_cache: return _css_cache[url]
    name = md5(url) + '.css'
    path = os.path.join(CSS_DIR, name)
    if not os.path.exists(path):
        try: css = fetch(url)
        except Exception as e:
            print('  css fail', url, e); return None
        def rep(m):
            u = m.group(1).strip().strip('\'"')
            if u.startswith('data:') or u.startswith('#'): return m.group(0)
            return 'url(' + local_asset(u, url) + ')'
        css = re.sub(r'url\(([^)]+)\)', rep, css)
        css = re.sub(r'@import\s+url\([^)]*\);?', '', css)
        open(path, 'w', encoding='utf8').write(css)
    _css_cache[url] = '/orig/css/' + name
    return _css_cache[url]

KEEP_CSS = re.compile(r'wp-content/(plugins/(elementor|essential-addons-for-elementor-lite|royal-elementor-addons)/|themes/hello-elementor/|uploads/(elementor|essential-addons-elementor)/)')
SKIP_CSS = re.compile(r'font-awesome|eicons|fontawesome|lightbox|swiper')

def head_css(h):
    out = []
    for m in re.finditer(r"<link[^>]+rel=['\"]stylesheet['\"][^>]*>", h):
        tag = m.group(0)
        href = re.search(r"href=['\"]([^'\"]+)['\"]", tag)
        if not href: continue
        u = htmllib.unescape(href.group(1))
        if u.startswith('//'): u = 'https:' + u
        if KEEP_CSS.search(u) and not SKIP_CSS.search(u):
            l = local_css(u)
            if l and l not in out: out.append(l)
    return out

def balanced_div(h, start):
    """Return the balanced <div>...</div> beginning at index start."""
    depth = 0
    for m in re.finditer(r'<div\b|</div>', h[start:]):
        depth += 1 if m.group(0) != '</div>' else -1
        if depth == 0: return h[start:start + m.end()]
    return h[start:]

def extract(h, kind):
    m = re.search(r'<div[^>]*data-elementor-type="%s"[^>]*>' % kind, h)
    if not m: return ''
    return balanced_div(h, m.start())

def replace_slider(frag):
    """Smart Slider needs its own JS; swap it for a static full-width banner."""
    i = frag.find('n2-section-smartslider')
    if i < 0: return frag
    cands = [m.start() for m in re.finditer(r'<div class="elementor-element[^"]*e-parent"', frag[:i])]
    w = cands[-1] if cands else frag.rfind('<div class="elementor-element', 0, i)
    block = balanced_div(frag, w)
    banner = '<div class="srt-hero"><img src="/images/hero.jpg" alt="SR Tours &amp; Travels" style="width:100%;display:block" /></div>'
    return frag[:w] + banner + frag[w + len(block):]

def clean(frag):
    frag = replace_slider(frag)
    frag = re.sub(r'<script\b.*?</script>', '', frag, flags=re.S)
    frag = re.sub(r'<noscript\b.*?</noscript>', '', frag, flags=re.S)
    frag = frag.replace('elementor-invisible', '')
    frag = re.sub(r'\sdata-settings="[^"]*"', '', frag)
    frag = re.sub(r"\sdata-settings='[^']*'", '', frag)

    def img(m):
        tag = m.group(0)
        a = dict((k.lower(), v) for k, v in re.findall(r'([\w:-]+)=["\']([^"\']*)["\']', tag))
        src = a.get('data-src') or a.get('data-lazy-src') or a.get('src') or ''
        if not src or src.startswith('data:'): return ''
        parts = ['src="%s"' % local_asset(src)]
        for k in ('class', 'alt', 'width', 'height', 'style'):
            if k in a: parts.append('%s="%s"' % (k, a[k]))
        return '<img %s />' % ' '.join(parts)
    frag = re.sub(r'<img\b[^>]*>', img, frag)

    def bg(m): return 'url(' + local_asset(m.group(1)) + ')'
    frag = re.sub(r'url\((?:&quot;|["\'])?(https?:[^)"\']+?)(?:&quot;|["\'])?\)', bg, frag)

    def link(m):
        u = htmllib.unescape(m.group(1))
        p = urllib.parse.urlparse(u)
        if p.netloc in ('srtours.net', 'www.srtours.net'):
            path = p.path.replace('/index.php', '').rstrip('/') or '/'
            return 'href="%s"' % path
        return m.group(0)
    frag = re.sub(r'href="([^"]*)"', link, frag)
    return frag

home = page_html(SITE + '/')
urls = []
for u in re.findall(r'<a[^>]+href="(https://srtours.net/[^"#?]*)"', home):
    if 'wp-' in u or 'feed' in u or 'index.php' in u or u in urls: continue
    urls.append(u)
print(len(urls), 'pages')

# prefetch html in parallel
with ThreadPoolExecutor(6) as ex: list(ex.map(lambda u: page_html(u), urls))

pages = {}
for u in urls:
    slug = u.rstrip('/').split('/')[-1]
    if slug == 'srtours.net': slug = 'home'
    h = page_html(u)
    title = re.search(r'<title>(.*?)</title>', h, re.S)
    main = clean(extract(h, 'wp-page'))
    pages[slug] = {
        'slug': slug, 'url': u,
        'title': htmllib.unescape(title.group(1)).strip() if title else slug,
        'html': main, 'css': head_css(h),
    }
    print(slug, len(main), len(pages[slug]['css']))

layout = {'footerHtml': clean(extract(home, 'templately-footer')), 'css': head_css(home)}
json.dump(pages, open(os.path.join(ROOT, 'server', 'pages.json'), 'w'), ensure_ascii=False)
json.dump(layout, open(os.path.join(ROOT, 'server', 'layout.json'), 'w'), ensure_ascii=False)
print('done', len(pages))
