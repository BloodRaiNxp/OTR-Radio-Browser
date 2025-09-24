function renderShows(shows) {
  currentShows = {}; // Reset

  const showList = document.getElementById('showList');
  showList.innerHTML = '';

  Object.entries(shows).forEach(([showName, show]) => {
    if (show.source) {
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
      currentShows[showName] = show;
      renderEpisodes(showName, show.description, show.episodes);
    }
  });
}

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
