let currentShows = {};
let currentGenre = 'westerns';

// Archive.org media sometimes blocks cross-origin loads
function normalizeAudioUrl(url) {
  if (typeof url !== 'string') return url;
  const from = 'https://archive.org/download/';
  const to = 'https://archive.org/cors/download/';
  if (url.startsWith(from)) return url.replace(from, to);
  return url;
}

// Load genre data
function loadGenre(genreName) {
  if (typeof genreName === 'string' && genreName.trim() !== '') {
    currentGenre = genreName;
    document.getElementById('show-list').innerHTML = '';
    const nav = document.getElementById('category-nav-container');
    if (nav) nav.innerHTML = '';
    const header = document.getElementById('category-header');
    if (header) header.innerHTML = '';
    currentShows = {};
    document.body.style.backgroundImage = '';

    fetch(`../data/${genreName}.json`)
      .then(res => res.json())
      .then(data => {
        if (data.background) {
          document.body.style.backgroundImage = `url('${data.background}')`;
        }
        renderCategoryNav(genreName, data);
        renderCategoryHeader(genreName, data);
        renderShows(data.shows);
      })
      .catch(error => {
        console.error("Genre load error:", error);
        document.getElementById('show-list').innerHTML = `<p class="error-message">⚠️ Could not load genre: ${genreName}</p>`;
      });
  }
}

// Render the category navigation bar
function renderCategoryNav(current, data) {
  const nav = document.getElementById('category-nav-container');
  if (!nav) return;
  const categories = [
    { name: 'Comedies', value: 'comedies' },
    { name: 'Detectives', value: 'detectives' },
    { name: 'Sci-Fi', value: 'sci-fi' },
    { name: 'Suspense and Horror', value: 'suspense-and-horror' },
    { name: 'Westerns', value: 'westerns' }
  ];
  nav.innerHTML = `<div class="mb-8 bg-surface-dark rounded-xl p-2 flex justify-center">
    <nav class="flex items-center gap-2">
      ${categories.map(cat =>
        `<a class="px-4 py-2 rounded-lg text-sm font-bold leading-normal transition-colors ${cat.value === current ? 'text-white bg-primary' : 'text-gray-400 hover:text-white hover:bg-white/10'}" href="#" onclick="loadGenre('${cat.value}');return false;">${cat.name}</a>`
      ).join('')}
    </nav>
  </div>`;
}

// Render the category header
function renderCategoryHeader(genreName, data) {
  const header = document.getElementById('category-header');
  if (!header) return;
  let title = genreName.replace(/-/g, ' ');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  let desc = (data && data.description) ? data.description : '';
  header.innerHTML = `
    <div class="relative w-full h-40 rounded-xl overflow-hidden mb-8 bg-surface-dark flex flex-col justify-center items-center">
      <h2 class="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">${title}</h2>
      <p class="text-gray-300 text-lg font-normal leading-normal max-w-2xl">${desc}</p>
    </div>
  `;
}

// Render shows and episodes
function renderShows(shows) {
  const showList = document.getElementById('show-list');
  if (!showList) return;
  showList.innerHTML = '';
  if (!shows) return;
  Object.entries(shows).forEach(([showName, show]) => {
    const showBox = document.createElement('div');
    showBox.className = 'mb-6 p-4 rounded-lg bg-surface-dark';

    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-primary mb-2';
    title.textContent = showName;
    showBox.appendChild(title);

    if (show.description) {
      const desc = document.createElement('p');
      desc.className = 'mb-2 text-gray-300';
      desc.textContent = show.description;
      showBox.appendChild(desc);
    }

    if (show.episodes && Array.isArray(show.episodes)) {
      show.episodes.forEach(episode => {
        const epDiv = document.createElement('div');
        epDiv.className = 'mb-2 p-2 rounded bg-background-dark flex items-center';

        const epTitle = document.createElement('span');
        epTitle.className = 'flex-1 text-white';
        epTitle.textContent = episode.title || 'Untitled';
        epDiv.appendChild(epTitle);

        if (episode.url) {
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = normalizeAudioUrl(episode.url);
          epDiv.appendChild(audio);
        } else {
          const noAudio = document.createElement('span');
          noAudio.className = 'ml-2 text-red-500 text-xs';
          noAudio.textContent = 'No audio available';
          epDiv.appendChild(noAudio);
        }

        showBox.appendChild(epDiv);
      });
    }

    showList.appendChild(showBox);
  });
}

// Initial load
window.onload = function() {
  loadGenre(currentGenre);
};
