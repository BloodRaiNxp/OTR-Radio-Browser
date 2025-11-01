// --- CONFIG ---
const genres = [
  { name: 'Comedies', value: 'comedies' },
  { name: 'Detectives', value: 'detectives' },
  { name: 'Sci-Fi', value: 'sci-fi' },
  { name: 'Suspense-and-Horror', value: 'suspense-and-horror' },
  { name: 'Westerns', value: 'westerns' }
];
const DEFAULT_GENRE = 'comedies';

// --- DOM HELPERS ---
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

// --- CATEGORY NAV WIRE-UP (STATIC) ---
function setupCategoryNav() {
  // Finds nav with category buttons, wires up clicks.
  const nav = document.querySelector('nav.flex.items-center, nav.rounded-full, nav.bg-surface-dark');
  if (!nav) return;
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const label = (a.textContent || a.innerText).trim();
      const genre = genres.find(g => label.includes(g.name))?.value;
      if (genre) loadGenre(genre);
      // Update active highlight
      nav.querySelectorAll('a').forEach(x => x.classList.remove('text-background-dark', 'bg-primary', 'font-semibold', 'text-white', 'bg-[var(--category-color)]'));
      if (genre) {
        a.classList.add('text-background-dark', 'bg-primary', 'font-semibold');
        // Special style for Detectives page
        if (genre === 'detectives') a.classList.add('bg-[var(--category-color)]', 'text-white');
      }
    });
  });
}

// --- SHOW CARD RENDERING ---
function cardHtml(title, show) {
  // Handles missing fields gracefully
  return `
    <div class="flex flex-col gap-4 rounded-xl bg-surface-dark/50 hover:bg-surface-dark transition-colors duration-300 group overflow-hidden">
      <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-xl" style='background-image: url("${show.image || ''}")'></div>
      <div class="flex flex-col flex-1 p-6 pt-0">
        <p class="text-white text-xl font-display font-bold">${title}</p>
        <p class="text-white/70 text-sm font-normal leading-normal mt-1">${show.description || ''}</p>
        ${show.audio ? `<button class="mt-4 flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-[0.015em] group-hover:bg-primary group-hover:text-background-dark transition-all duration-300" data-audio="${show.audio}">
          <span class="truncate">Listen Now</span>
        </button>` : ""}
      </div>
    </div>
  `;
}

// --- GRID RENDERING ---
function renderGrid(showsObj) {
  // Find the grid container (your static grid in homepage is .grid)
  const grid = document.querySelector('.grid');
  if (!grid) return;
  grid.innerHTML = Object.entries(showsObj).map(([title, show]) => cardHtml(title, show)).join('');
  // Wire up Listen Now buttons
  grid.querySelectorAll('button[data-audio]').forEach(btn => {
    btn.onclick = function() {
      const url = btn.getAttribute('data-audio');
      if (url) {
        let audio = document.getElementById('main-audio');
        if (!audio) {
          audio = document.createElement('audio');
          audio.id = 'main-audio';
          audio.style.display = 'none';
          document.body.appendChild(audio);
        }
        audio.src = url;
        audio.play();
      }
    }
  });
}

// --- LOAD DATA AND RENDER ---
function loadGenre(genre) {
  fetch(`../data/${genre}.json`)
    .then(res => res.json())
    .then(data => {
      renderGrid(data.shows || {});
      // Optionally update category nav highlight, if dynamic
    });
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
  setupCategoryNav();
  loadGenre(DEFAULT_GENRE);
});
