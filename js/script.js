function loadGenre(genre) {
  const fileName = genre
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/&/g, 'and') + '.json';

  console.log("✅ script.js loaded");
  console.log("Trying to load genre:", genre);
  console.log("Fetching file:", `data/${fileName}`);

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
  const showList = document.getElementById('showList');
  showList.innerHTML = '';

  const showKeys = Object.keys(shows);
  if (showKeys.length === 0) {
    showList.innerHTML = `<p>No shows available for this genre.</p>`;
    return;
  }

  showKeys.forEach(showName => {
    const show = shows[showName];

    const showTitle = document.createElement('div');
    showTitle.className = 'show-title';
    showTitle.textContent = showName;
    showList.appendChild(showTitle);

    const showDesc = document.createElement('p');
    showDesc.textContent = show.description;
    showList.appendChild(showDesc);

    if (!show.episodes || show.episodes.length === 0) {
      const noEpisodes = document.createElement('p');
      noEpisodes.textContent = "No episodes available.";
      showList.appendChild(noEpisodes);
      return;
    }

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

document.addEventListener('DOMContentLoaded', () => {
  const genreSelect = document.getElementById('genreSelect');
  if (genreSelect) {
    loadGenre(genreSelect.value);
    genreSelect.addEventListener('change', () => {
      loadGenre(genreSelect.value);
    });
  }
});
