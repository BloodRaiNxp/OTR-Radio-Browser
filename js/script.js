// Load JSON data
let jsonData;

fetch('data/radioData.json')
  .then(response => response.json())
  .then(data => {
    jsonData = data;
    loadGenre('Westerns'); // Default genre on load
  });

// Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Load selected genre
document.getElementById('genreSelect').addEventListener('change', function () {
  const selectedGenre = this.value;
  loadGenre(selectedGenre);
});

function loadGenre(genre) {
  const genreData = jsonData.genres[genre];
  document.body.style.backgroundImage = `url(${genreData.background})`;

  const showList = document.getElementById('showList');
  showList.innerHTML = '';

  const showKeys = shuffle(Object.keys(genreData.shows));

  showKeys.forEach(showName => {
    const show = genreData.shows[showName];

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
