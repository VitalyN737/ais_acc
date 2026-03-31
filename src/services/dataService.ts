const CONTENT_REPO = import.meta.env.VITE_CONTENT_REPO || "VitalyN737/ais_acc";
const CONTENT_BRANCH = import.meta.env.VITE_CONTENT_BRANCH || "main";
const CONTENT_ROOT = "src/content";

const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${CONTENT_REPO}/${CONTENT_BRANCH}/${CONTENT_ROOT}`;
const GITHUB_API_BASE = `https://api.github.com/repos/${CONTENT_REPO}/contents/${CONTENT_ROOT}`;

const DEFAULT_MANIFEST: Record<string, string[]> = {
  news: [
    "european-tour-2024.json",
    "masterclass-tokyo-2024.json",
    "slavic-soul-release.json"
  ],
  performances: [
    "liederabend-2024.json",
    "tokyo-spring-2024.json",
    "verdi-gala-2024.json"
  ],
  gallery: ["gallery-0.json"],
  media: [
    "mozart-don-giovanni-audio.json",
    "rachmaninoff-vocalise-video.json",
    "schubert-winterreise-audio.json",
    "tchaikovsky-onegin-video.json",
    "tchaikovsky-queen-of-spades-audio.json",
    "verdi-rigoletto-audio.json",
    "verdi-traviata-video.json"
  ],
  repertoire: ["germont.json", "onegin.json"],
  cds: [
    "italian-arias-cd.json",
    "rachmaninoff-songs-cd.json",
    "slavic-soul-cd.json",
    "verdi-highlights-cd.json"
  ]
};

let manifestCache: Record<string, string[]> | null = null;
const collectionCache = new Map<string, string[]>();

export async function fetchJson(path: string) {
  const url = `${GITHUB_RAW_BASE}/${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} from ${CONTENT_REPO}@${CONTENT_BRANCH}`);
  }

  return response.json();
}

async function listCollectionFiles(collectionName: string) {
  if (collectionCache.has(collectionName)) {
    return collectionCache.get(collectionName)!;
  }

  const listUrl = `${GITHUB_API_BASE}/${collectionName}?ref=${CONTENT_BRANCH}&t=${Date.now()}`;
  const response = await fetch(listUrl);

  if (!response.ok) {
    throw new Error(`Failed to list ${collectionName} from ${CONTENT_REPO}@${CONTENT_BRANCH}`);
  }

  const entries = await response.json();
  const files = Array.isArray(entries)
    ? entries
        .filter((entry: { type: string; name: string }) => entry.type === "file" && entry.name.endsWith(".json"))
        .map((entry: { name: string }) => entry.name)
        .sort((a: string, b: string) => a.localeCompare(b))
    : [];

  collectionCache.set(collectionName, files);
  return files;
}

async function getManifest() {
  if (manifestCache) return manifestCache;

  try {
    manifestCache = await fetchJson("manifest.json");
    return manifestCache;
  } catch (error) {
    console.warn("Failed to fetch manifest.json from GitHub, using embedded manifest.", error);
    return DEFAULT_MANIFEST;
  }
}

export async function fetchCollection(collectionName: string) {
  let files: string[] = [];

  try {
    files = await listCollectionFiles(collectionName);
  } catch (error) {
    console.warn(`Failed to list ${collectionName} via GitHub API, falling back to manifest.`, error);
    const manifest = await getManifest();
    files = manifest[collectionName] || [];
  }

  if (files.length === 0) {
    console.warn(`No files found for collection ${collectionName}.`);
    return [];
  }

  return Promise.all(files.map(file => fetchJson(`${collectionName}/${file}`)));
}
