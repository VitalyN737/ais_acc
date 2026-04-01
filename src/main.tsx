import './index.css';
import { fetchJson, fetchCollection } from './services/dataService';

type AppData = {
  home: any;
  profile: any;
  contact: any;
  footer: any;
  performances: any[];
  news: any[];
  gallery: any[];
  media: any[];
  repertoire: any[];
  cds: any[];
};

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const initialData: AppData = {
  home: { hero: {} },
  profile: { bio: [] },
  contact: { management: {} },
  footer: { links: [] },
  performances: [],
  news: [],
  gallery: [],
  media: [],
  repertoire: [],
  cds: []
};

let data: AppData = initialData;

const safe = (value: unknown) => String(value ?? '');

const renderHome = () => `
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-10">
    <div class="lg:col-span-7 flex flex-col gap-6">
      <span class="text-slate-400 font-bold tracking-[0.3em] uppercase text-sm">${safe(data.home?.hero?.welcomeText)}</span>
      <h1 class="text-6xl md:text-8xl font-black leading-none tracking-tighter">
        ${safe(data.home?.hero?.firstName)}<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">${safe(data.home?.hero?.lastName)}</span>
      </h1>
      <p class="text-lg text-slate-400 max-w-xl leading-relaxed">${safe(data.home?.hero?.description)}</p>
      <div class="flex flex-wrap gap-4 mt-4">
        <a href="#/schedule" class="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg">View Schedule</a>
        <a href="#/media" class="px-8 py-4 rounded-xl glass text-slate-100 font-bold text-lg">Watch Media</a>
      </div>
    </div>
    <div class="lg:col-span-5">
      <div class="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl glass p-3">
        <div class="w-full h-full rounded-2xl bg-cover bg-center" style="background-image:url('${safe(data.home?.hero?.image)}')"></div>
      </div>
    </div>
  </section>
`;

const cardList = (items: any[], type: 'news' | 'performances' | 'media' | 'gallery' | 'repertoire' | 'cds') => {
  if (!items.length) return '<p class="text-slate-400">No content yet.</p>';

  return items.map((item) => `
    <article class="glass-card rounded-2xl border border-white/10 p-6">
      <h3 class="text-xl font-bold mb-2">${safe(item.title || item.role || item.composer || item.id)}</h3>
      ${item.image ? `<div class="h-48 rounded-xl bg-cover bg-center mb-4" style="background-image:url('${safe(item.image)}')"></div>` : ''}
      ${type === 'performances' ? `<p class="text-slate-300">${safe(item.month)} ${safe(item.day)} · ${safe(item.location)}</p>` : ''}
      ${type === 'repertoire' ? `<p class="text-slate-300">${safe(item.composer)} · ${safe(item.role)}</p>` : ''}
      ${type === 'cds' ? `<p class="text-slate-300">${safe(item.year)}</p>` : ''}
      <p class="text-slate-400">${safe(item.description || item.subtitle || item.body || '')}</p>
    </article>
  `).join('');
};

const routes: Record<string, () => string> = {
  '/': () => renderHome(),
  '/schedule': () => `<section class="py-10"><h2 class="text-4xl font-black mb-10">Performance Schedule</h2><div class="grid gap-6">${cardList(data.performances, 'performances')}</div></section>`,
  '/news': () => `<section class="py-10"><h2 class="text-4xl font-black mb-10">Latest News</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${cardList(data.news, 'news')}</div></section>`,
  '/profile': () => `<section class="py-10 glass-card rounded-3xl p-10 border border-white/10"><h2 class="text-4xl font-black mb-6">${safe(data.profile?.name)}</h2><p class="text-slate-300 text-lg">${(data.profile?.bio || []).map(safe).join('</p><p class="text-slate-300 text-lg mt-4">')}</p></section>`,
  '/gallery': () => `<section class="py-10"><h2 class="text-4xl font-black mb-10">Gallery</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-6">${cardList(data.gallery, 'gallery')}</div></section>`,
  '/media': () => `<section class="py-10"><h2 class="text-4xl font-black mb-10">Media</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${cardList(data.media, 'media')}</div></section>`,
  '/repertoire': () => `<section class="py-10"><h2 class="text-4xl font-black mb-10">Repertoire</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${cardList(data.repertoire, 'repertoire')}</div></section>`,
  '/cd': () => `<section class="py-10"><h2 class="text-4xl font-black mb-10">Discography</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${cardList(data.cds, 'cds')}</div></section>`,
  '/contact': () => `<section class="py-10 glass-card rounded-3xl p-10 border border-white/10"><h2 class="text-4xl font-black mb-6">${safe(data.contact?.title)}</h2><p class="text-slate-300 mb-6">${safe(data.contact?.description)}</p><p class="text-slate-200">${safe(data.contact?.management?.name)} · ${safe(data.contact?.management?.location)} · <a class="text-primary" href="mailto:${safe(data.contact?.management?.email)}">${safe(data.contact?.management?.email)}</a></p></section>`
};

function navLink(path: string, label: string) {
  return `<a href="#${path}" class="text-sm font-medium hover:text-primary transition-colors">${label}</a>`;
}

function getPath() {
  const hash = window.location.hash || '#/';
  return hash.replace(/^#/, '');
}

function renderApp() {
  const path = getPath();
  const view = routes[path] || routes['/'];

  root.innerHTML = `
    <div class="relative overflow-x-hidden gradient-bg selection:bg-primary selection:text-white min-h-screen">
      <div class="layout-container flex flex-col min-h-screen">
        <header class="sticky top-0 z-50 px-6 py-4 flex items-center justify-between glass mx-4 mt-4 rounded-xl">
          <a href="#/" class="text-lg font-black tracking-tight uppercase">VITALY YUSHMANOV</a>
          <nav class="hidden lg:flex items-center gap-8">
            ${navLink('/schedule', 'Schedule')}
            ${navLink('/news', 'News')}
            ${navLink('/profile', 'Profile')}
            ${navLink('/gallery', 'Gallery')}
            ${navLink('/media', 'Media')}
            ${navLink('/cd', 'CD')}
            ${navLink('/repertoire', 'Repertoire')}
            ${navLink('/contact', 'Contact')}
          </nav>
        </header>

        <main class="flex-1 px-6 max-w-7xl mx-auto w-full pt-8 pb-20">
          ${view()}
        </main>

        <footer class="px-6 pb-10 text-slate-400 max-w-7xl mx-auto w-full">
          <div class="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between gap-4">
            <span>${safe(data.footer?.copyright)}</span>
            <div class="flex gap-4">${(data.footer?.links || []).map((link: string) => `<span>${safe(link)}</span>`).join('')}</div>
          </div>
        </footer>
      </div>
    </div>
  `;
}

async function loadData() {
  const [home, profile, contact, footer, performances, news, gallery, media, repertoire, cds] = await Promise.all([
    fetchJson('home.json'),
    fetchJson('profile.json'),
    fetchJson('contact.json'),
    fetchJson('footer.json'),
    fetchCollection('performances'),
    fetchCollection('news'),
    fetchCollection('gallery'),
    fetchCollection('media'),
    fetchCollection('repertoire'),
    fetchCollection('cds')
  ]);

  data = { home, profile, contact, footer, performances, news, gallery, media, repertoire, cds };
  renderApp();
}

window.addEventListener('hashchange', renderApp);

loadData().catch((error) => {
  console.error(error);
  root.innerHTML = '<div class="min-h-screen flex items-center justify-center text-red-300">Failed to load content.</div>';
});
