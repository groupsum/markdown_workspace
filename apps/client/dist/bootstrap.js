const INDEX_PATH = '/client/versions/index.json';
const SELECTED_VERSION_STORAGE_KEY = 'lattice-selected-client-version';
const statusNode = document.getElementById('bootstrap-status');

const setStatus = (message) => {
  if (statusNode) statusNode.textContent = message;
};

const resolveSelectedVersion = (manifest) => {
  const available = Array.isArray(manifest.available) ? manifest.available : [];
  const stored = window.localStorage.getItem(SELECTED_VERSION_STORAGE_KEY);
  const latest = manifest.latest || available[0]?.version || "1.4.20";
  const storedEntry = stored ? available.find((entry) => entry.version === stored && entry.isSelectable) : null;
  return storedEntry?.version || latest;
};

const goToVersion = (version) => {
  window.localStorage.setItem(SELECTED_VERSION_STORAGE_KEY, version);
  const target = '/client/versions/' + encodeURIComponent(version) + '/';
  if (window.location.pathname !== target) {
    window.location.replace(target);
  }
};

fetch(INDEX_PATH, { cache: 'no-store' })
  .then(async (response) => {
    if (!response.ok) throw new Error('Unable to load retained client manifest');
    const manifest = await response.json();
    const version = resolveSelectedVersion(manifest);
    setStatus('Loading version ' + version + '...');
    goToVersion(version);
  })
  .catch((error) => {
    console.error(error);
    setStatus('Unable to load retained client manifest. Verify /client/versions/index.json is present.');
  });