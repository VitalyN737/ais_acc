const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/VitalyN737/ais_acc/main/src/content";
const GITHUB_API_BASE = "https://api.github.com/repos/VitalyN737/ais_acc/contents/src/content";

// Fallback list of files in case GitHub API is rate-limited and manifest is missing
const FALLBACK_MANIFEST: Record<string, string[]> = {
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
  gallery: [
    "gallery-0.json"
  ],
  media: [
    "mozart-don-giovanni-audio.json",
    "rachmaninoff-vocalise-video.json",
    "schubert-winterreise-audio.json",
    "tchaikovsky-onegin-video.json",
    "tchaikovsky-queen-of-spades-audio.json",
    "verdi-rigoletto-audio.json",
    "verdi-traviata-video.json"
  ],
  repertoire: [
    "germont.json",
    "onegin.json"
  ],
  cds: [
    "italian-arias-cd.json",
    "rachmaninoff-songs-cd.json",
    "slavic-soul-cd.json",
    "verdi-highlights-cd.json"
  ]
};

export async function fetchJson(path: string) {
  const url = `${GITHUB_RAW_BASE}/${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
  console.log(`Fetching JSON: ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
}

export async function fetchCollection(collectionName: string) {
  try {
    // 1. Try to fetch from GitHub API (might fail due to rate limits)
    const url = `${GITHUB_API_BASE}/${collectionName}?t=${Date.now()}`;
    console.log(`Attempting API fetch for ${collectionName}: ${url}`);
    const response = await fetch(url);
    
    if (response.ok) {
      const files = await response.json();
      const dataPromises = files
        .filter((file: any) => file.name.endsWith('.json'))
        .map(async (file: any) => {
          const downloadUrl = `${file.download_url}${file.download_url.includes('?') ? '&' : '?'}t=${Date.now()}`;
          const res = await fetch(downloadUrl);
          return res.json();
        });
      return Promise.all(dataPromises);
    }
    
    if (response.status === 403) {
      console.warn(`GitHub API Rate Limit hit for ${collectionName}. Using fallback.`);
    }
  } catch (e) {
    console.error(`Error fetching collection ${collectionName} via API:`, e);
  }

  // 2. Fallback: Fetch known files directly from RAW (bypasses API limits)
  console.log(`Using fallback for ${collectionName}`);
  const fallbackFiles = FALLBACK_MANIFEST[collectionName] || [];
  const dataPromises = fallbackFiles.map(file => fetchJson(`${collectionName}/${file}`));
  return Promise.all(dataPromises);
}
