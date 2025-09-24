function loadGenre(genre) {
  const fileName = genre.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and') + '.json';
  fetch(`data/${fileName}`)
    .then(response => response.json())
    .then(genreData => {
      document.body.style.backgroundImage = `url(${genreData.background})`;
      renderShows(genreData.shows);
    });
}

function renderShows(shows) {
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
