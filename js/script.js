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
  header.setAttribute('title', showName); // Add title attribute for full name

  // Indicator arrow
  const indicator = document.createElement('span');
  indicator.textContent = '\u25b6'; // Closed by default
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
    indicator.textContent = expanded ? '\u25bc' : '\u25b6';
  });
  header.addEventListener('keydown', (e) => {
    if (e.key === "Enter" || e.key === " ") {
      header.click();
    }
  });

  showBox.appendChild(header);
  showBox.appendChild(content);
  showList.appendChild(showBox);

  // Accessibility: Set title only if visually truncated
  setTimeout(() => {
    if (header.scrollWidth > header.clientWidth) {
      header.setAttribute('title', showName);
    } else {
      header.removeAttribute('title');
    }
  }, 15);
}

// ...rest of file unchanged...