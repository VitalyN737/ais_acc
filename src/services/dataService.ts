const CONTENT_REPO = import.meta.env.VITE_CONTENT_REPO || "VitalyN737/ais_acc";
const CONTENT_BRANCH = import.meta.env.VITE_CONTENT_BRANCH || "main";
const CONTENT_ROOT = "src/content";

const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${CONTENT_REPO}/${CONTENT_BRANCH}/${CONTENT_ROOT}`;
const GITHUB_API_BASE = `https://api.github.com/repos/${CONTENT_REPO}/contents/${CONTENT_ROOT}`;
const LOCAL_CONTENT_GLOB = import.meta.glob("../content/**/*.json", { eager: true });

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

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

function parseMarkdownFrontmatter(markdown: string) {
  if (!markdown.startsWith("---")) {
    return { body: markdown.trim() };
  }

  const endIndex = markdown.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { body: markdown.trim() };
  }

  const frontmatter = markdown.slice(3, endIndex).trim();
  const body = markdown.slice(endIndex + 4).trim();

  const data: Record<string, unknown> = {};
  frontmatter.split("\n").forEach(line => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) return;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    data[key] = parseScalar(value);
  });

  return {
    ...data,
    body
  };
}


function readLocalJson(path: string) {
  const localModulePath = `../content/${path}`;
  const moduleValue = LOCAL_CONTENT_GLOB[localModulePath] as { default?: unknown } | undefined;

  if (!moduleValue || typeof moduleValue !== "object" || !("default" in moduleValue)) {
    throw new Error(`Local content file not found: ${path}`);
  }

  return moduleValue.default;
}

async function fetchContentFile(path: string) {
  const url = `${GITHUB_RAW_BASE}/${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} from ${CONTENT_REPO}@${CONTENT_BRANCH}`);
  }

  if (path.endsWith(".json")) {
    return response.json();
  }

  if (path.endsWith(".md") || path.endsWith(".markdown")) {
    const text = await response.text();
    return parseMarkdownFrontmatter(text);
  }

  return response.json();
}

export async function fetchJson(path: string) {
  try {
    return await fetchContentFile(path);
  } catch (error) {
    console.warn(`Remote fetch failed for ${path}. Using local fallback.`, error);
    return readLocalJson(path);
  }
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
        .filter(
          (entry: { type: string; name: string }) =>
            entry.type === "file" && (entry.name.endsWith(".json") || entry.name.endsWith(".md") || entry.name.endsWith(".markdown"))
        )
        .map((entry: { name: string }) => entry.name)
        .sort((a: string, b: string) => a.localeCompare(b))
    : [];

  collectionCache.set(collectionName, files);
  return files;
}

function listLocalCollectionFiles(collectionName: string) {
  const prefix = `../content/${collectionName}/`;
  return Object.keys(LOCAL_CONTENT_GLOB)
    .filter(key => key.startsWith(prefix) && key.endsWith(".json"))
    .map(key => key.replace(prefix, ""))
    .sort((a, b) => a.localeCompare(b));
}

async function getManifest() {
  if (manifestCache) return manifestCache;

  try {
    manifestCache = await fetchContentFile("manifest.json");
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
    console.warn(`Failed to list ${collectionName} via GitHub API, trying local files.`, error);
    files = listLocalCollectionFiles(collectionName);

    if (files.length === 0) {
      const manifest = await getManifest();
      files = manifest[collectionName] || [];
    }
  }

  if (files.length === 0) {
    console.warn(`No files found for collection ${collectionName}.`);
    return [];
  }

  const contentResults = await Promise.allSettled(
    files.map(file => fetchContentFile(`${collectionName}/${file}`))
  );

  const successful = contentResults
    .filter((result): result is PromiseFulfilledResult<unknown> => result.status === "fulfilled")
    .map(result => result.value);

  if (successful.length > 0) {
    return successful;
  }

  console.warn(`Remote content fetch failed for ${collectionName}. Using local collection fallback.`);
  return files
    .filter(file => file.endsWith(".json"))
    .map(file => readLocalJson(`${collectionName}/${file}`));
}
