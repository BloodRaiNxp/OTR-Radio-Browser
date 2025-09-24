let currentShows = {};
let currentGenre = 'westerns';

// Load genre data
function loadGenre(genreName) {
  currentGenre = genreName;

  // 🔧 Safe reset before loading
  document.getElementById('showList').innerHTML = '';
  document.getElementById('marqueeText').textContent = '';
  currentShows = {};
  document.body.style.backgroundImage = '';

  fetch(`data/${genreName}.json`)
    .then(res => res.json())
    .then(data => {
      document.body.style.backgroundImage = `url('${data.background}')`;
      renderShows(data.shows);
    })
    .catch(error => {
      console.error("Genre load error:", error);
      document.getElementById('showList').innerHTML = `<p style="color:red;">⚠️ Could not load genre: ${genreName}</p>`;
    });
}

// Render shows and episodes
function renderShows(shows) {
  currentShows = {};
  const showList = document.getElementById('showList');
  showList.innerHTML = '';

  Object.entries(shows).forEach(([showName, show]) => {
    if (show.source) {
      // Modular loading from external file
      fetch(show.source)
        .then(res => res.json())
        .then(episodes => {
          currentShows[showName] = { description: show.description, episodes };
          renderEpisodes(showName, show.description, episodes);
        })
        .catch(err => {
          console.error(`Error loading ${showName}:`, err);
          showList.innerHTML += `<p style="color:red;">⚠️ Could not load episodes for ${showName}</p>`;
        });
    } else if (show.episodes) {
      // Embedded episodes
      currentShows[showName] = show;
      renderEpisodes(showName, show.description, show.episodes);
    }
  });
}

// Render episode list
function renderEpisodes(showName, description, episodes) {
  const showList = document.getElementById('showList');

  const showTitle = document.createElement('div');
  showTitle.className = 'show-title';
  showTitle.textContent = showName;
  showList.appendChild(showTitle);

  if (description) {
    const showDesc = document.createElement('p');
    showDesc.textContent = description;
    showList.appendChild(showDesc);
  }

  episodes.forEach(episode => {
    const epDiv = document.createElement('div');
    epDiv.className = 'episode';

    const epLink = document.createElement('a');
    epLink.href = episode.url;
    epLink.textContent = episode.title;
    epLink.target = '_blank';

    epLink.addEventListener('click', () => {
      document.getElementById('marqueeText').textContent = `Now Playing: ${episode.title} from ${showName}`;
    });

    epDiv.appendChild(epLink);
    showList.appendChild(epDiv);
  });
}

// Surprise Me button
document.getElementById('surpriseBtn').addEventListener('click', () => {
  const allEpisodes = [];

  Object.entries(currentShows).forEach(([showName, show]) => {
    if (show.episodes) {
      show.episodes.forEach(ep => {
        allEpisodes.push({ ...ep, showName });
      });
    }
  });

  if (allEpisodes.length > 0) {
    const random = allEpisodes[Math.floor(Math.random() * allEpisodes.length)];
    document.getElementById('marqueeText').textContent = `🎧 Surprise: ${random.title} from ${random.showName}`;
    window.open(random.url, '_blank');
  }
});

// Genre selector
document.getElementById('genreSelect').addEventListener('change', (e) => {
  loadGenre(e.target.value);
});

// Initial load
loadGenre(currentGenre);

// ✅ Global error listener (restored)
window.addEventListener('error', function(e) {
  console.error("Global error caught:", e.message);
});
