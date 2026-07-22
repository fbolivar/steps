// Service worker mínimo para PWA instalable + fallback offline básico.
const CACHE = 'steps-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add('/')).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  // Network-first; si falla (offline), intenta caché y como último recurso la home.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (req.mode === 'navigate') {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('/')))
  )
})
