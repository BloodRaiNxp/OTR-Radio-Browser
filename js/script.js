let currentShows = {};
let currentGenre = 'westerns';
let lastPlayingBlock = null;
let cachedEpisodes = [];

// Archive.org media sometimes blocks cross-origin loads;
// use their CORS mirror for reliable playback.
function normalizeAudioUrl(url) {
  if (typeof url !== 'string') return url;
  const from = 'https://archive.org/download/';
  const to = 'https://archive.org/cors/download/';
  if (url.startsWith(from)) return url.replace(from, to);
  return url;
}

// Pause all audio except the one passed in, and clear playing-now on others
function pauseAllAudioPlayers(except = null) {
  document.querySelectorAll('audio').forEach(aud => {
    if (aud !== except) aud.pause();
  });
  document.querySelectorAll('.playing-now').forEach(box => {
    if (!except || !box.contains(except)) box.classList.remove('playing-now');
  });
}

// Load genre data
function loadGenre(genreName) {
  if (typeof genreName === 'string' && genreName.trim() !== '') {
    currentGenre = genreName;
  document.getElementById('show-list').innerHTML = '';
  // Optionally clear header/nav containers
  const nav = document.getElementById('category-nav-container');
  if (nav) nav.innerHTML = '';
  const header = document.getElementById('category-header');
  if (header) header.innerHTML = '';
    currentShows = {};
    document.body.style.backgroundImage = '';

    fetch(`../data/${genreName}.json`)
      .then(res => res.json())
      .then(data => {
        // Set background only if provided and non-empty
        if (data.background) {
          document.body.style.backgroundImage = `url('${data.background}')`;
        }
        renderCategoryNav(genreName);
        renderCategoryHeader(genreName, data);
        renderShows(data.shows);
      })
      .catch(error => {
        console.error("Genre load error:", error);
        document.getElementById('show-list').innerHTML = `<p class="error-message">⚠️ Could not load genre: ${genreName}</p>`;
      });

}

// ... rest of file unchanged ...
