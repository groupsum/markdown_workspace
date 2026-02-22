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
];
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/react@19.0.0/jsx-runtime',
  'https://esm.sh/lucide-react@0.475.0',
  'https://esm.sh/react-markdown@9.0.3?bundle',
  'https://esm.sh/remark-gfm@4.0.1?bundle',
  'https://esm.sh/remark-supersub@1.0.0?bundle',
  'https://esm.sh/react-syntax-highlighter@15.6.1',
  'https://esm.sh/react-syntax-highlighter@15.6.1/dist/esm/styles/prism',
  'https://esm.sh/jszip@3.10.1',
  'https://esm.sh/path@^0.12.7',
  'https://esm.sh/url@^0.11.4',
  'https://esm.sh/vite@^7.3.1',
  'https://esm.sh/@vitejs/plugin-react@^5.1.2'
];

let metaState = {
  lastKnownGoodVersion: null,
  failedVersions: []
};
let failureTimer = null;
const UPDATE_HEALTH_TIMEOUT_MS = 1000 * 60;

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

const isAppCache = (name) => name.startsWith(CACHE_PREFIX);

const findFallbackResponse = async (request, cacheNames) => {
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  return undefined;
};

const getFallbackCacheNames = async (activeCacheName) => {
  const cacheNames = await caches.keys();
  const appCacheNames = cacheNames.filter(isAppCache);
  const prioritized = [];

  if (activeCacheName && appCacheNames.includes(activeCacheName)) {
    prioritized.push(activeCacheName);
  }

  if (CURRENT_CACHE !== activeCacheName && appCacheNames.includes(CURRENT_CACHE)) {
    prioritized.push(CURRENT_CACHE);
  }

  if (metaState.lastKnownGoodVersion) {
    const lastKnownGoodCache = getCacheNameForVersion(metaState.lastKnownGoodVersion);
    if (!prioritized.includes(lastKnownGoodCache) && appCacheNames.includes(lastKnownGoodCache)) {
      prioritized.push(lastKnownGoodCache);
    }
  }

  appCacheNames.forEach((cacheName) => {
    if (!prioritized.includes(cacheName)) {
      prioritized.push(cacheName);
    }
  });

  return prioritized;
};

const getCachedAppShell = async (activeCacheName) => {
  const fallbackCacheNames = await getFallbackCacheNames(activeCacheName);
  return (
    (await findFallbackResponse('/index.html', fallbackCacheNames)) ||
    (await findFallbackResponse('/', fallbackCacheNames))
  );
};

const getActiveCacheName = () => {
  if (isFailedVersion(CURRENT_VERSION) && metaState.lastKnownGoodVersion) {
    return getCacheNameForVersion(metaState.lastKnownGoodVersion);
  }
  return CURRENT_CACHE;
};

const isSuccessfulResponse = (response) => Boolean(response) && response.ok;

const fetchAndCache = async ({ request, cache, cacheKey = request, allowOpaque = false }) => {
  const response = await fetch(request);
  if (isSuccessfulResponse(response) || (allowOpaque && response.type === 'opaque')) {
    cache.put(cacheKey, response.clone());
    return response;
  }
  return undefined;
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

const scheduleFailureCheck = async () => {
  if (failureTimer) {
    clearTimeout(failureTimer);
    failureTimer = null;
  }

  if (
    !metaState.lastKnownGoodVersion ||
    metaState.lastKnownGoodVersion === CURRENT_VERSION ||
    isFailedVersion(CURRENT_VERSION)
  ) {
    return;
  }

  const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (!windowClients.length) {
    return;
  }

  failureTimer = setTimeout(async () => {
    const activeClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (!activeClients.length || metaState.lastKnownGoodVersion === CURRENT_VERSION) {
      return;
    }
    await markVersionFailed(CURRENT_VERSION);
  }, UPDATE_HEALTH_TIMEOUT_MS);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CURRENT_CACHE);
      const assetsToCache = CORE_ASSETS.concat(EXTERNAL_ASSETS);
      await Promise.allSettled(assetsToCache.map((asset) => cache.add(asset)));
    })()
  );
});

const CHECK_FOR_UPDATES_TAG = 'check-for-updates';

const runUpdateCheck = async () => {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.postMessage({ type: 'PWA_BACKGROUND_UPDATE_CHECK' }));
};

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
      if ('periodicSync' in self.registration) {
        try {
          await self.registration.periodicSync.register(CHECK_FOR_UPDATES_TAG, {
            minInterval: 1000 * 60 * 30,
          });
        } catch {
          // Ignore unsupported permission states.
        }
      }
      await scheduleFailureCheck();
    })()
  );
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== CHECK_FOR_UPDATES_TAG) {
    return;
  }
  event.waitUntil(runUpdateCheck());
});

self.addEventListener('sync', (event) => {
  if (event.tag !== CHECK_FOR_UPDATES_TAG) {
    return;
  }
  event.waitUntil(runUpdateCheck());
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

  if (event.request.destination === 'style') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(getActiveCacheName());
        try {
          const response = await fetchAndCache({ request: event.request, cache, allowOpaque: true });
          if (!response) {
            throw new Error('Network responded without a cacheable stylesheet response');
          }
          return response;
        } catch (error) {
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const fallbackCacheNames = await getFallbackCacheNames(getActiveCacheName());
          const crossCacheResponse = await findFallbackResponse(event.request, fallbackCacheNames);
          if (crossCacheResponse) {
            return crossCacheResponse;
          }
          throw error;
        }
      })()
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const activeCacheName = getActiveCacheName();
        try {
          const cache = await caches.open(activeCacheName);
          const response = await fetchAndCache({
            request: event.request,
            cache,
            cacheKey: '/index.html',
          });
          if (!response) {
            throw new Error('Navigation response was not successful');
          }
          return response;
        } catch (error) {
          const cache = await caches.open(activeCacheName);
          const cachedResponse = await cache.match('/index.html');
          if (cachedResponse) {
            return cachedResponse;
          }
          const crossCacheAppShell = await getCachedAppShell(activeCacheName);
          if (crossCacheAppShell) {
            return crossCacheAppShell;
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

      const fetchPromise = fetchAndCache({ request: event.request, cache, allowOpaque: true }).catch(() => undefined);

      if (cachedResponse) {
        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      const response = await fetchPromise;
      if (response) {
        return response;
      }
      const cachedAppShell = await getCachedAppShell(getActiveCacheName());
      if (cachedAppShell) {
        return cachedAppShell;
      }
      return caches.match('/index.html');
    })()
  );
});
