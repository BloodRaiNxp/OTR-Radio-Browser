let currentShows = {};

function loadGenre(genre) {
  const fileName = genre.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and') + '.json';
  fetch(`data/${fileName}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Could not load ${fileName}`);
      }
      return response.json();
    })
    .then(genreData => {
      if (!genreData.shows || !genreData.background) {
        throw new Error(`Invalid structure in ${fileName}`);
      }

      document.body.style.backgroundImage = `url(${genreData.background})`;
      renderShows(genreData.shows);
    })
    .catch(error => {
      console.error("Genre load error:", error);
      document.getElementById('showList').innerHTML = `
        <div class="error-message">
          <p style="color: red;">⚠️ Could not load genre: <strong>${genre}</strong></p>
          <p>Check if the file <code>${fileName}</code> exists and is valid JSON.</p>
        </div>
      `;
    });
}

function renderShows(shows) {
  currentShows = shows;
  const showList = document.getElementById('showList');
  showList.innerHTML = '';

  const showKeys = Object.keys(shows);
  showKeys.forEach(showName => {
    const show = shows[showName];

    const showTitle = document.createElement('div');
    showTitle.className = 'show-title';
    showTitle.textContent = showName;
    showList.appendChild(showTitle);

    const showDesc = document.createElement('p');
    showDesc.textContent = show.description;
    showList.appendChild(showDesc);

    show.episodes.forEach(episode => {
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
  });
}

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

document.addEventListener('DOMContentLoaded', () => {
  const genreSelect = document.getElementById('genreSelect');
  if (genreSelect) {
    loadGenre(genreSelect.value);
    genreSelect.addEventListener('change', () => {
      loadGenre(genreSelect.value);
    });
  }
});
