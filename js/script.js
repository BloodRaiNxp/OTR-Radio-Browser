let currentShows = {};
let currentGenre = 'westerns';
let lastPlayingBlock = null;

// Load genre data
function loadGenre(genreName) {
  currentGenre = genreName;

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

// Render shows and episodes (now collapsible)
function renderShows(shows) {
  currentShows = {};
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

// Render episode list inside collapsible <details>
function renderEpisodes(showName, description, episodes) {
  const showList = document.getElementById('showList');

  const details = document.createElement('details');
  details.open = true;

  const summary = document.createElement('summary');
  summary.className = 'show-title';
  summary.textContent = showName;
  details.appendChild(summary);

  if (description) {
    const showDesc = document.createElement('p');
    showDesc.textContent = description;
    details.appendChild(showDesc);
  }

  episodes.forEach(episode => {
    const epDiv = document.createElement('div');
    epDiv.className = 'episode';

    const epTitle = document.createElement('div');
    epTitle.textContent = episode.title;
    epTitle.className = 'episode-title';

    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.src = episode.url;

    audioPlayer.addEventListener('play', () => {
      document.getElementById('marqueeText').textContent = `🎧 Now Playing: ${episode.title} from ${showName}`;
      if (lastPlayingBlock) lastPlayingBlock.classList.remove('playing-now');
      epDiv.classList.add('playing-now');
      lastPlayingBlock = epDiv;
    });

    epDiv.appendChild(epTitle);
    epDiv.appendChild(audioPlayer);
    details.appendChild(epDiv);
  });

  showList.appendChild(details);
}

// Surprise Me button (embedded + dismissable)
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
    document.getElementById('marqueeText').textContent = `🎧 Choose a category or roll random`;

    const showList = document.getElementById('showList');
    const surpriseBlock = document.createElement('div');
    surpriseBlock.className = 'episode surprise-block';

    const epTitle = document.createElement('div');
    epTitle.textContent = random.title;
    epTitle.className = 'episode-title';

    const dismissBtn = document.createElement('span');
    dismissBtn.textContent = '✖';
    dismissBtn.className = 'dismiss-btn';
    dismissBtn.title = 'Remove';
    dismissBtn.addEventListener('click', () => {
      surpriseBlock.remove();
    });

    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.src = random.url;
    audioPlayer.autoplay = true;

    audioPlayer.addEventListener('play', () => {
      document.getElementById('marqueeText').textContent = `🎧 Surprise: ${random.title} from ${random.showName}`;
      if (lastPlayingBlock) lastPlayingBlock.classList.remove('playing-now');
      surpriseBlock.classList.add('playing-now');
      lastPlayingBlock = surpriseBlock;
    });

    epTitle.appendChild(dismissBtn);
    surpriseBlock.appendChild(epTitle);
    surpriseBlock.appendChild(audioPlayer);
    showList.prepend(surpriseBlock);
  }
});

// Genre selector
document.getElementById('genreSelect').addEventListener('change', (e) => {
  loadGenre(e.target.value.toLowerCase());
});

// Initial load
loadGenre(currentGenre);

// Global error listener
window.addEventListener('error', function(e) {
  console.error("Global error caught:", e.message);
});
