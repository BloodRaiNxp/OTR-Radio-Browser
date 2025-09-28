let currentShows = {};
let currentGenre = 'westerns';
let lastPlayingBlock = null;
let cachedEpisodes = [];

// Load genre data
function loadGenre(genreName) {
  if (typeof genreName === 'string' && genreName.trim() !== '') {
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
        document.getElementById('showList').innerHTML = `<p class="error-message">⚠️ Could not load genre: ${genreName}</p>`;
      });
  } else {
    console.warn('Invalid genreName provided:', genreName);
    document.body.style.backgroundImage = "url('images/loading-bg.jpg')"; // Use a loading or placeholder image
    return;
  }
}

// Render shows and episodes (collapsible .show-box divs)
function renderShows(shows) {
  currentShows = {};
  cachedEpisodes = [];
  const showList = document.getElementById('showList');
  showList.innerHTML = '';

  // Ensure error container exists
  let errorContainer = document.getElementById('errorContainer');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'errorContainer';
    errorContainer.style.color = 'red';
    errorContainer.style.marginBottom = '1em';
    showList.parentNode.insertBefore(errorContainer, showList);
  }
  errorContainer.innerHTML = '';

  Object.entries(shows).forEach(([showName, show]) => {
    if (show.source) {
      fetch(show.source)
        .then(res => res.json())
        .then(episodes => {
          currentShows[showName] = { description: show.description, episodes };
          renderShowBox(showName, show.description, episodes);
          // Cache episodes for surprise button
          episodes.forEach(ep => {
            cachedEpisodes.push({ ...ep, showName });
          });
        })
        .catch(err => {
          console.error(`Error loading ${showName}:`, err);
          const errorContainer = document.getElementById('errorContainer');
          if (errorContainer) {
            errorContainer.innerHTML += `<p>⚠️ Could not load episodes for ${showName}</p>`;
          }
        });
    } else if (show.episodes) {
      currentShows[showName] = show;
      renderShowBox(showName, show.description, show.episodes);
      // Cache episodes for surprise button
      show.episodes.forEach(ep => {
        cachedEpisodes.push({ ...ep, showName });
      });
    }
  });
  // Indicator arrow
  const indicator = document.createElement('span');
  indicator.textContent = '\u25b6'; // Closed by default
  indicator.setAttribute('aria-label', 'Expand/collapse show'); // Accessibility label
  indicator.style.marginRight = '8px';
  indicator.style.transition = 'transform 0.2s';
  const showBox = document.createElement('div');
  showBox.className = 'show-box';

  // Header (collapsible control)
  const header = document.createElement('h2');
  header.className = 'show-title';
  header.tabIndex = 0;
  header.style.cursor = 'pointer';

  // Subtle instruction
  const instruction = document.createElement('span');
  instruction.textContent = ' (click to expand)';
  instruction.style.fontSize = '0.85em';
  instruction.style.color = '#888';

  // Accessibility: update instruction text based on focus method
  header.addEventListener('focus', (e) => {
    if (e.detail === 0) { // Keyboard focus
      instruction.textContent = ' (press Enter or Space to expand)';
    }
  });
  header.addEventListener('blur', () => {
    instruction.textContent = ' (click to expand)';
  });

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

    // Check if episode has a URL for audio
    if (episode.url) {
      const audioPlayer = document.createElement('audio');
      audioPlayer.controls = true;
      audioPlayer.src = episode.url;

      audioPlayer.addEventListener('play', () => {
        document.getElementById('marqueeText').textContent = `🎧 Now Playing: ${episode.title} from ${showName}`;
        if (lastPlayingBlock) lastPlayingBlock.classList.remove('playing-now');
        epDiv.classList.add('playing-now');
        lastPlayingBlock = epDiv;
      });
      audioPlayer.addEventListener('pause', () => {
        document.getElementById('marqueeText').textContent = '';
        if (epDiv.classList.contains('playing-now')) {
          epDiv.classList.remove('playing-now');
          lastPlayingBlock = null;
        }
      });
      audioPlayer.addEventListener('ended', () => {
        document.getElementById('marqueeText').textContent = '';
        if (epDiv.classList.contains('playing-now')) {
          epDiv.classList.remove('playing-now');
          lastPlayingBlock = null;
        }
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
}

// Surprise Me button (only one surprise block at a time)
document.getElementById('surpriseBtn').addEventListener('click', () => {
const showList = document.getElementById('showList');
  // Remove any previous surprise block
  const previousSurprise = showList.querySelector('.surprise-block');
  if (previousSurprise) previousSurprise.remove();

  // Use cached episodes for surprise button
  if (cachedEpisodes.length > 0) {
    const random = cachedEpisodes[Math.floor(Math.random() * cachedEpisodes.length)];
    document.getElementById('marqueeText').textContent = `🎧 Surprise: ${random.title} from ${random.showName}`;

    const surpriseBlock = document.createElement('div');
    surpriseBlock.className = 'episode surprise-block';

    const epTitle = document.createElement('div');
    epTitle.textContent = random.title;
    epTitle.title = random.title;
    surpriseBlock.appendChild(epTitle);

    const dismissBtn = document.createElement('span');
    dismissBtn.textContent = '\u2716';
    dismissBtn.className = 'dismiss-btn';
    dismissBtn.title = 'Remove';
    dismissBtn.style.marginLeft = '8px';
    dismissBtn.addEventListener('click', () => {
      surpriseBlock.remove();
      document.getElementById('marqueeText').textContent = '';
      if (surpriseBlock.classList.contains('playing-now')) {
        surpriseBlock.classList.remove('playing-now');
        lastPlayingBlock = null;
      }
    });
    surpriseBlock.appendChild(dismissBtn);

if (random.url) {
  const audioPlayer = document.createElement('audio');
  audioPlayer.controls = true;
  audioPlayer.src = random.url;

  audioPlayer.addEventListener('play', () => {
    document.getElementById('marqueeText').textContent = `🎧 Surprise: ${random.title} from ${random.showName}`;
    if (lastPlayingBlock) lastPlayingBlock.classList.remove('playing-now');
    surpriseBlock.classList.add('playing-now');
    lastPlayingBlock = surpriseBlock;
  });
  audioPlayer.addEventListener('pause', () => {
    document.getElementById('marqueeText').textContent = '';
    if (surpriseBlock.classList.contains('playing-now')) {
      surpriseBlock.classList.remove('playing-now');
      lastPlayingBlock = null;
    }
  });
  audioPlayer.addEventListener('ended', () => {
    document.getElementById('marqueeText').textContent = '';
    if (surpriseBlock.classList.contains('playing-now')) {
      surpriseBlock.classList.remove('playing-now');
      lastPlayingBlock = null;
    }
  });

  surpriseBlock.appendChild(audioPlayer);

  // Attempt to play audio after user interaction
  setTimeout(() => {
    audioPlayer.play().catch(() => {
      // Playback failed due to browser policy; user must manually press play
      const warning = document.createElement('div');
      warning.textContent = '🔈 Click play to listen (autoplay blocked by browser)';
      warning.className = 'autoplay-warning';
      warning.style.color = '#d9534f';
      warning.style.fontSize = '0.95em';
      warning.style.marginTop = '0.5em';
      surpriseBlock.appendChild(warning);
    });
  }, 200);
} else {
  const noAudio = document.createElement('span');
  noAudio.textContent = 'Audio unavailable';
  noAudio.className = 'no-audio';
  surpriseBlock.appendChild(noAudio);
}

showList.prepend(surpriseBlock);
  }
});

window.addEventListener('error', function(e) {
  console.error("Global error caught:", e.message);
  const showList = document.getElementById('showList');
  if (showList) {
    showList.innerHTML = `
      <p class="error-message">
        ⚠️ An unexpected error occurred.<br>
        Please check your internet connection.<br>
        <button id="retryBtn" style="margin-top:8px;">Retry</button>
      </p>
    `;
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        location.reload();
      });
    }
  }
});
// <-- Add this block after the error handler closes
window.onload = function() {
  loadGenre(currentGenre);
};
