const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_PATH = SCOPE_URL.pathname.endsWith('/') ? SCOPE_URL.pathname : `${SCOPE_URL.pathname}/`;
const SCOPE_KEY = SCOPE_PATH.replace(/[^\w-]+/g, '_');
const VERSION_MATCH = SCOPE_PATH.match(/\/client\/versions\/([^/]+)\//);
const CURRENT_VERSION = VERSION_MATCH?.[1] || 'dev';
const CACHE_PREFIX = `mdwork-${SCOPE_KEY}-`;
const META_CACHE = 'mdwork-meta';
const META_KEY = `/pwa-meta/${SCOPE_KEY}`;
const CURRENT_CACHE = `${CACHE_PREFIX}${CURRENT_VERSION}`;
const INDEX_CACHE_KEY = `${SCOPE_PATH}index.html`;
const CORE_ASSETS = [
  SCOPE_PATH,
  INDEX_CACHE_KEY,
  `${SCOPE_PATH}manifest.webmanifest`,
  `${SCOPE_PATH}favicon.svg`,
  `${SCOPE_PATH}icons/icon-192.svg`,
  `${SCOPE_PATH}icons/icon-512.svg`,
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

const normalizeRequest = (request) => {
  if (typeof request === 'string') {
    return request;
  }
  const url = new URL(request.url);
  return url.toString();
};

const getCachedAppShell = async (activeCacheName) => {
  const cache = await caches.open(activeCacheName);
  return (
    (await cache.match(INDEX_CACHE_KEY)) ||
    (await cache.match(SCOPE_PATH))
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
    await cache.put(cacheKey, response.clone());
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
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && !keep.has(key))
          .map((key) => caches.delete(key))
      );
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
            cacheKey: INDEX_CACHE_KEY,
          });
          if (!response) {
            throw new Error('Navigation response was not successful');
          }
          return response;
        } catch (error) {
          const cache = await caches.open(activeCacheName);
          const cachedResponse = await cache.match(INDEX_CACHE_KEY);
          if (cachedResponse) {
            return cachedResponse;
          }
          const cachedAppShell = await getCachedAppShell(activeCacheName);
          if (cachedAppShell) {
            return cachedAppShell;
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
      const cacheKey = normalizeRequest(event.request);
      const cachedResponse = await cache.match(cacheKey) || await cache.match(event.request);
      const fetchPromise = fetchAndCache({ request: event.request, cache, cacheKey, allowOpaque: true }).catch(() => undefined);

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
      return caches.match(INDEX_CACHE_KEY);
    })()
  );
});
