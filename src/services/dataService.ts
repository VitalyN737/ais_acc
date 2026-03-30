const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/VitalyN737/ais_acc/main/src/content";
const GITHUB_API_BASE = "https://api.github.com/repos/VitalyN737/ais_acc/contents/src/content";

export async function fetchJson(path: string) {
  const url = `${GITHUB_RAW_BASE}/${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
  console.log(`Fetching JSON: ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
}

export async function fetchCollection(collectionName: string) {
  const url = `${GITHUB_API_BASE}/${collectionName}?t=${Date.now()}`;
  console.log(`Fetching Collection List: ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch collection ${collectionName}`);
  const files = await response.json();
  
  const dataPromises = files
    .filter((file: any) => file.name.endsWith('.json'))
    .map(async (file: any) => {
      const downloadUrl = `${file.download_url}${file.download_url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      console.log(`Fetching Collection Item: ${downloadUrl}`);
      const res = await fetch(downloadUrl);
      return res.json();
    });
    
  return Promise.all(dataPromises);
}
