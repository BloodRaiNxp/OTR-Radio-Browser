// --- CONFIG ---
const genres = [
  { name: 'Comedies', value: 'comedies' },
  { name: 'Detectives', value: 'detectives' },
  { name: 'Sci-Fi', value: 'sci-fi' },
  { name: 'Suspense and Horror', value: 'suspense-and-horror' },
  { name: 'Westerns', value: 'westerns' }
];
const DEFAULT_GENRE = 'comedies'; // This should match your initial highlight

// --- RENDER NAV ---
function renderCategoryNav(selected) {
  const navRoot = document.getElementById('category-nav-container');
  navRoot.innerHTML = `
    <nav class="flex items-center gap-2 sm:gap-4 p-1 bg-surface-dark rounded-full border border-white/10 justify-center">
      ${genres.map(cat =>
        `<a class="px-5 py-2 text-sm font-${cat.value === selected ? 'semibold' : 'medium'} rounded-full ${cat.value === selected ? 'text-background-dark bg-primary' : 'text-white/70 hover:text-white'} transition-colors" href="#" data-genre="${cat.value}">${cat.name}</a>`
      ).join('')}
    </nav>
  `;
  navRoot.querySelectorAll('a[data-genre]').forEach(a => {
    a.onclick = e => {
      e.preventDefault();
      loadGenre(a.getAttribute('data-genre'));
    };
  });
}

// --- RENDER HEADER ---
function renderCategoryHeader(genre, data) {
  const header = document.getElementById('category-header');
  let title = genres.find(g => g.value === genre)?.name || genre;
  let desc = data && data.description ? data.description : '';
  header.innerHTML = `
    <div class="relative w-full h-40 rounded-xl overflow-hidden mb-8 bg-surface-dark flex flex-col justify-center items-center">
      <h2 class="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">${title}</h2>
      <p class="text-gray-300 text-lg font-normal leading-normal max-w-2xl">${desc}</p>
    </div>
  `;
}

// --- RENDER SHOWS ---
function renderShows(showArr) {
  const showList = document.getElementById('show-list');
  showList.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
    ${showArr.map(show => `
      <div class="flex flex-col gap-4 rounded-xl bg-surface-dark/50 hover:bg-surface-dark transition-colors duration-300 group overflow-hidden">
        <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-xl" style='background-image: url("${show.image || ''}");'></div>
        <div class="flex flex-col flex-1 p-6 pt-0">
          <p class="text-white text-xl font-display font-bold">${show.title || ''}</p>
          <p class="text-white/70 text-sm font-normal leading-normal mt-1">${show.description || ''}</p>
          <button class="mt-4 flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-[0.015em] group-hover:bg-primary group-hover:text-background-dark transition-all duration-300" data-audio="${show.audio || ''}">
            <span class="truncate">Listen Now</span>
          </button>
        </div>
      </div>
    `).join('')}
  </div>`;

  // Add "Listen Now" functionality
  showList.querySelectorAll('button[data-audio]').forEach(btn => {
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
        showMarquee(btn.parentElement.querySelector('p').textContent);
      }
    };
  });
}

// --- SHOW MARQUEE ("Now Playing") ---
function showMarquee(text) {
  const marquee = document.getElementById('marqueeText');
  marquee.textContent = text ? `Now Playing: ${text}` : '';
}

// --- LOAD GENRE DATA ---
function loadGenre(genre) {
  fetch(`../data/${genre}.json`)
    .then(res => res.json())
    .then(data => {
      renderCategoryNav(genre);
      renderCategoryHeader(genre, data);
      renderShows(data.shows || []);
    });
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  loadGenre(DEFAULT_GENRE);
});
