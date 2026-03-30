const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/VitalyN737/ais_acc/main/src/content";
const GITHUB_API_BASE = "https://api.github.com/repos/VitalyN737/ais_acc/contents/src/content";

export async function fetchJson(path: string) {
  const response = await fetch(`${GITHUB_RAW_BASE}/${path}?t=${Date.now()}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
}

export async function fetchCollection(collectionName: string) {
  const response = await fetch(`${GITHUB_API_BASE}/${collectionName}?t=${Date.now()}`);
  if (!response.ok) throw new Error(`Failed to fetch collection ${collectionName}`);
  const files = await response.json();
  
  const dataPromises = files
    .filter((file: any) => file.name.endsWith('.json'))
    .map(async (file: any) => {
      const res = await fetch(`${file.download_url}?t=${Date.now()}`);
      return res.json();
    });
    
  return Promise.all(dataPromises);
}
