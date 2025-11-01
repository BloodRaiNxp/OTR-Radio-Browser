// --- CONFIG ---
const genres = [
  { name: 'Comedies', value: 'comedies' },
  { name: 'Detectives', value: 'detectives' },
  { name: 'Sci-Fi', value: 'sci-fi' },
  { name: 'Suspense & Horror', value: 'suspense-and-horror' },
  { name: 'Westerns', value: 'westerns' }
];
const DEFAULT_GENRE = 'comedies';

// --- STATE ---
let currentGenre = DEFAULT_GENRE;

// --- DOM HELPERS ---
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

// --- SANITIZATION HELPERS ---
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeUrl(url) {
  // Only allow http, https, and data URLs
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.match(/^(https?:|data:image\/)/i)) {
    return trimmed;
  }
  return '';
}

// --- CATEGORY NAV CREATION ---
function createCategoryNav() {
  const nav = qs('#category-nav');
  if (!nav) return;
  
  // Create nav buttons (genres are from config, but we'll sanitize for safety)
  nav.innerHTML = genres.map(genre => {
    const safeName = escapeHtml(genre.name);
    const safeValue = escapeHtml(genre.value);
    const isActive = safeValue === currentGenre;
    const activeClass = isActive ? 'bg-primary text-background-dark' : 'text-white/70 hover:text-white hover:bg-white/10';
    
    return `
      <a href="#" 
         class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-300 ${activeClass}"
         data-genre="${safeValue}">
        <span class="truncate">${safeName}</span>
      </a>
    `;
  }).join('');
  
  // Wire up click handlers
  nav.querySelectorAll('a[data-genre]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const genre = link.getAttribute('data-genre');
      if (genre) {
        currentGenre = genre;
        loadGenre(genre);
        updateActiveNav(genre);
      }
    });
  });
}

// --- UPDATE ACTIVE NAV HIGHLIGHT ---
function updateActiveNav(genre) {
  const nav = qs('#category-nav');
  if (!nav) return;
  
  nav.querySelectorAll('a[data-genre]').forEach(link => {
    const linkGenre = link.getAttribute('data-genre');
    if (linkGenre === genre) {
      link.className = 'flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-300 bg-primary text-background-dark';
    } else {
      link.className = 'flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10';
    }
  });
}

// --- SHOW CARD RENDERING ---
function createShowCard(title, show) {
  // Sanitize inputs
  const safeName = escapeHtml(title);
  const safeDescription = escapeHtml(show.description || 'Classic radio show');
  const safeSource = show.source ? escapeHtml(show.source) : '';
  
  // Use placeholder image if not provided, with sanitized URL
  const imageUrl = sanitizeUrl(show.image) || `https://via.placeholder.com/400x225/1E1E1E/D4AF37?text=${encodeURIComponent(title)}`;
  
  return `
    <div class="flex flex-col gap-4 rounded-xl bg-surface-dark/50 hover:bg-surface-dark transition-colors duration-300 group overflow-hidden">
      <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-xl" style='background-image: url("${imageUrl}")'></div>
      <div class="flex flex-col flex-1 p-6 pt-0">
        <p class="text-white text-xl font-display font-bold">${safeName}</p>
        <p class="text-white/70 text-sm font-normal leading-normal mt-1">${safeDescription}</p>
        ${safeSource ? `
          <button class="mt-4 flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-[0.015em] group-hover:bg-primary group-hover:text-background-dark transition-all duration-300" data-source="${safeSource}">
            <span class="truncate">View Episodes</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// --- GRID RENDERING ---
function renderGrid(showsObj) {
  const grid = qs('#show-grid');
  if (!grid) return;
  
  if (!showsObj || Object.keys(showsObj).length === 0) {
    grid.innerHTML = '<p class="text-white/60 col-span-full text-center py-12">No shows available in this category.</p>';
    return;
  }
  
  grid.innerHTML = Object.entries(showsObj).map(([title, show]) => 
    createShowCard(title, show)
  ).join('');
  
  // Wire up View Episodes buttons
  grid.querySelectorAll('button[data-source]').forEach(btn => {
    btn.onclick = function() {
      const source = btn.getAttribute('data-source');
      if (source) {
        // Navigate to episode list (placeholder for now)
        console.log('Navigate to:', source);
        alert('Episode list functionality coming soon!\nSource: ' + source);
      }
    }
  });
}

// --- LOAD DATA AND RENDER ---
function loadGenre(genre) {
  // Adjust path - from ui/index.html, data is at ../data/
  fetch(`../data/${genre}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${genre}.json`);
      return res.json();
    })
    .then(data => {
      renderGrid(data.shows || {});
    })
    .catch(err => {
      console.error('Error loading genre:', err);
      const grid = qs('#show-grid');
      if (grid) {
        grid.innerHTML = `<p class="text-red-400 col-span-full text-center py-12">Error loading shows: ${err.message}</p>`;
      }
    });
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
  createCategoryNav();
  loadGenre(DEFAULT_GENRE);
});
