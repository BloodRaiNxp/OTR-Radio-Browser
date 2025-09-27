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

// Render shows and episodes (collapsible .show-box divs)
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
          renderShowBox(showName, show.description, episodes);
        })
        .catch(err => {
          console.error(`Error loading ${showName}:`, err);
          showList.innerHTML += `<p style="color:red;">⚠️ Could not load episodes for ${showName}</p>`;
        });
    } else if (show.episodes) {
      currentShows[showName] = show;
      renderShowBox(showName, show.description, show.episodes);
    }
  });
}

// Render a single show as a collapsible .show-box
function renderShowBox(showName, description, episodes) {
  const showList = document.getElementById('showList');
  const showBox = document.createElement('div');
  showBox.className = 'show-box';

  // Header (collapsible control)
  const header = document.createElement('h2');
  header.className = 'show-title';
  header.tabIndex = 0;
  header.style.cursor = 'pointer';

  // Indicator arrow
  const indicator = document.createElement('span');
  indicator.textContent = '▶'; // Closed by default
  indicator.style.marginRight = '8px';
  indicator.style.transition = 'transform 0.2s';

  // Subtle instruction
  const instruction = document.createElement('span');
  instruction.textContent = ' (click to expand)';
  instruction.style.fontSize = '0.85em';
  instruction.style.color = '#888';

  header.appendChild(indicator);
  header.appendChild(document.createTextNode(showName));
  header.appendChild(instruction);

  // Collapsible content container
  const content = document.createElement('div');
  content.className = 'episode-list';
  content.style.display = 'none'; // Closed by default

  // Optional description
  if (description) {
    const showDesc = document.createElement('p');
    showDesc.textContent = description;
    showDesc.style.marginBottom = '0.7em';
    content.appendChild(showDesc);
  }

  // Add episodes
  episodes.forEach(episode => {
    const epDiv = document.createElement('div');
    epDiv.className = 'episode';

    const epTitle = document.createElement('div');
    epTitle.textContent = episode.title;
    epTitle.className = 'episode-title';

    if (episode.url && episode.url.trim() !== '') {
      const audioPlayer = document.createElement('audio');
      audioPlayer.controls = true;
      audioPlayer.src = episode.url;

      audioPlayer.addEventListener('play', () => {
        document.getElementById('marqueeText').textContent = `🎧 Now Playing: ${episode.title} from ${showName}`;
        if (lastPlayingBlock) lastPlayingBlock.classList.remove('playing-now');
        epDiv.classList.add('playing-now');
        lastPlayingBlock = epDiv;
      });

      epDiv.appendChild(audioPlayer);
    } else {
      const noAudio = document.createElement('span');
      noAudio.textContent = 'Audio unavailable';
      noAudio.className = 'no-audio';
      epDiv.appendChild(noAudio);
    }

    epDiv.appendChild(epTitle);
    content.appendChild(epDiv);
  });

  // Collapsible logic
  let expanded = false;
  header.addEventListener('click', () => {
    expanded = !expanded;
    content.style.display = expanded ? 'block' : 'none';
    indicator.textContent = expanded ? '▼' : '▶';
  });
  header.addEventListener('keydown', (e) => {
    if (e.key === "Enter" || e.key === " ") {
      header.click();
    }
  });

  showBox.appendChild(header);
  showBox.appendChild(content);
  showList.appendChild(showBox);
}

// Surprise Me button (only one surprise block at a time)
document.getElementById('surpriseBtn').addEventListener('click', () => {
  const showList = document.getElementById('showList');
  // Remove any previous surprise block
  const previousSurprise = showList.querySelector('.surprise-block');
  if (previousSurprise) previousSurprise.remove();

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
