const CACHE_PREFIX = 'lattice-architect-';
const META_CACHE = 'lattice-architect-meta';
const META_KEY = '/pwa-meta';
const CURRENT_VERSION = new URL(self.location.href).searchParams.get('version') || 'dev';
const CURRENT_CACHE = `${CACHE_PREFIX}${CURRENT_VERSION}`;
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/css/index.css',
  '/css/themes/theme-micropress.css'
];

let metaState = {
  lastKnownGoodVersion: null,
  failedVersions: []
};
let failureTimer = null;

const readMeta = async () => {
  const cache = await caches.open(META_CACHE);
  const response = await cache.match(META_KEY);
  if (!response) {
    return metaState;
  }
  try {
    const data = await response.json();
    metaState = {
      lastKnownGoodVersion: typeof data.lastKnownGoodVersion === 'string' ? data.lastKnownGoodVersion : null,
      failedVersions: Array.isArray(data.failedVersions)
        ? data.failedVersions.filter((version) => typeof version === 'string')
        : []
    };
  } catch {
    metaState = { lastKnownGoodVersion: null, failedVersions: [] };
  }
  return metaState;
};

const writeMeta = async () => {
  const cache = await caches.open(META_CACHE);
  const response = new Response(JSON.stringify(metaState), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put(META_KEY, response);
};

const isFailedVersion = (version) => metaState.failedVersions.includes(version);

const getCacheNameForVersion = (version) => `${CACHE_PREFIX}${version}`;

const getActiveCacheName = () => {
  if (isFailedVersion(CURRENT_VERSION) && metaState.lastKnownGoodVersion) {
    return getCacheNameForVersion(metaState.lastKnownGoodVersion);
  }
  return CURRENT_CACHE;
};

const notifyClients = async (payload) => {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.postMessage(payload));
};

const markVersionFailed = async (version) => {
  if (!version || isFailedVersion(version)) {
    return;
  }
  metaState.failedVersions = [...metaState.failedVersions, version];
  await writeMeta();
  await notifyClients({ type: 'PWA_UPDATE_FAILED', version });
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.navigate(client.url));
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CURRENT_CACHE);
      await Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset)));
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await readMeta();
      const keys = await caches.keys();
      const keep = new Set([CURRENT_CACHE, META_CACHE]);
      if (metaState.lastKnownGoodVersion) {
        keep.add(getCacheNameForVersion(metaState.lastKnownGoodVersion));
      }
      await Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
      if (failureTimer) {
        clearTimeout(failureTimer);
      }
      if (
        metaState.lastKnownGoodVersion &&
        metaState.lastKnownGoodVersion !== CURRENT_VERSION &&
        !isFailedVersion(CURRENT_VERSION)
      ) {
        failureTimer = setTimeout(() => {
          markVersionFailed(CURRENT_VERSION);
        }, 15000);
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLIENT_READY') {
    const version = typeof event.data.version === 'string' ? event.data.version : null;
    if (version) {
      metaState.lastKnownGoodVersion = version;
      metaState.failedVersions = metaState.failedVersions.filter((item) => item !== version);
      if (failureTimer) {
        clearTimeout(failureTimer);
        failureTimer = null;
      }
      event.waitUntil(writeMeta());
    }
  }
  if (event.data && event.data.type === 'MARK_FAILED_VERSION') {
    const version = typeof event.data.version === 'string' ? event.data.version : null;
    if (version) {
      event.waitUntil(markVersionFailed(version));
    }
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const activeCacheName = getActiveCacheName();
        try {
          const response = await fetch(event.request);
          const cache = await caches.open(activeCacheName);
          cache.put(event.request, response.clone());
          return response;
        } catch (error) {
          const cache = await caches.open(activeCacheName);
          const cachedResponse = await cache.match('/index.html');
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(getActiveCacheName());
      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => undefined);

      if (cachedResponse) {
        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      const response = await fetchPromise;
      if (response) {
        return response;
      }
      return caches.match('/index.html');
    })()
  );
});
