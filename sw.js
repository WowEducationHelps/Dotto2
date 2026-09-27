const PREFIX = 'do-pwa-';
const CACHE = PREFIX + 'v2';
const SHELL = ['./', './index.html', './app.css', './app.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png', './icons/apple-touch-icon.png'];
const VIDEOS = ['./media/intro-portrait.mp4', './media/intro-landscape.mp4'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // An unavailable video must not prevent installation of the app shell.
    await Promise.all(VIDEOS.map(url => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => (key.startsWith(PREFIX) || key === 'do-v1') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
async function videoResponse(request, cache) {
  const hit = await cache.match(request.url);
  if (!hit) return fetch(request);
  const range = request.headers.get('range');
  if (!range) return hit;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return fetch(request);
  const data = await hit.arrayBuffer(), size = data.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start >= size || end < start) return new Response(null, {status:416, headers:{'Content-Range':`bytes */${size}`}});
  return new Response(data.slice(start, end + 1), {status:206, headers:{'Content-Type':'video/mp4', 'Accept-Ranges':'bytes', 'Content-Range':`bytes ${start}-${end}/${size}`, 'Content-Length':String(end - start + 1)}});
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (url.pathname.endsWith('.mp4')) return videoResponse(request, cache);
    if (request.mode === 'navigate') {
      try { return await fetch(request); }
      catch (_) { return (await cache.match('./index.html')) || Response.error(); }
    }
    return (await cache.match(request)) || fetch(request);
  })());
});
