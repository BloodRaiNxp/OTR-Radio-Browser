let currentShows = {};
let currentGenre = 'westerns';
let lastPlayingBlock = null;
let cachedEpisodes = [];

// Archive.org media sometimes blocks cross-origin loads;
// use their CORS mirror for reliable playback.
function normalizeAudioUrl(url) {
  if (typeof url !== 'string') return url;
  const from = 'https://archive.org/download/';
  const to = 'https://archive.org/cors/download/';
  if (url.startsWith(from)) return url.replace(from, to);
  return url;
}

// Pause all audio except the one passed in, and clear playing-now on others
function pauseAllAudioPlayers(except = null) {
  document.querySelectorAll('audio').forEach(aud => {
    if (aud !== except) aud.pause();
  });
  document.querySelectorAll('.playing-now').forEach(box => {
    if (!except || !box.contains(except)) box.classList.remove('playing-now');
  });
}

// Load genre data
function loadGenre(genreName) {
  if (typeof genreName === 'string' && genreName.trim() !== '') {
    currentGenre = genreName;
  document.getElementById('show-list').innerHTML = '';
  // Optionally clear header/nav containers
  const nav = document.getElementById('category-nav-container');
  if (nav) nav.innerHTML = '';
  const header = document.getElementById('category-header');
  if (header) header.innerHTML = '';
    currentShows = {};
    document.body.style.backgroundImage = '';

    fetch(`data/${genreName}.json`)
      .then(res => res.json())
      .then(data => {
        // Set background only if provided and non-empty
        if (data.background) {
          document.body.style.backgroundImage = `url('${data.background}')`;
        }
        renderCategoryNav(genreName);
        renderCategoryHeader(genreName, data);
        renderShows(data.shows);
      })
      .catch(error => {
        console.error("Genre load error:", error);
        document.getElementById('show-list').innerHTML = `<p class="error-message">⚠️ Could not load genre: ${genreName}</p>`;
      });

}

// Render the category navigation bar
function renderCategoryNav(current) {
  const nav = document.getElementById('category-nav-container');
  if (!nav) return;
  const categories = [
    { name: 'Comedies', value: 'comedies' },
    { name: 'Detectives', value: 'detectives' },
    { name: 'Sci-Fi', value: 'sci-fi' },
    { name: 'Suspense-and-Horror', value: 'suspense-and-horror' },
    { name: 'Westerns', value: 'westerns' }
  ];
  nav.innerHTML = `<div class="mb-8 bg-surface-dark rounded-xl p-2 flex justify-center">
    <nav class="flex items-center gap-2">
      <a class="text-white hover:bg-white/20 bg-white/10 px-4 py-2 rounded-lg text-sm font-bold leading-normal transition-colors" href="../home_screen.html">Home</a>
      ${categories.map(cat =>
        `<a class="${cat.value === current ? 'text-white bg-[var(--category-color)]' : 'text-gray-400 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-lg text-sm font-${cat.value === current ? 'bold' : 'medium'} leading-normal transition-colors" href="#" onclick="loadGenre('${cat.value}')">${cat.name}</a>`
      ).join('')}
    </nav>
  </div>`;
}

// Render the category header
function renderCategoryHeader(genreName, data) {
  const header = document.getElementById('category-header');
  if (!header) return;
  // Pick a color for each category
  const colorMap = {
    'comedies': '#f59e42',
    'detectives': '#1e40af',
    'sci-fi': '#10b981',
    'suspense-and-horror': '#be185d',
    'westerns': '#fbbf24'
  };
  document.documentElement.style.setProperty('--category-color', colorMap[genreName] || '#1e40af');
  // Title and description
  let title = genreName.replace(/-/g, ' ');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  let desc = '';
  if (data && data.description) desc = data.description;
  else if (genreName === 'westerns') desc = 'Classic western radio adventures.';
  else if (genreName === 'comedies') desc = 'Classic radio comedies.';
  else if (genreName === 'detectives') desc = 'A collection of classic detective and mystery radio shows, from hardboiled PIs to clever sleuths.';
  else if (genreName === 'sci-fi') desc = 'Science fiction radio from the golden age.';
  else if (genreName === 'suspense-and-horror') desc = 'Chilling suspense and horror radio shows.';
  header.innerHTML = `
    <div class="relative w-full h-80 rounded-xl overflow-hidden mb-12">
      <div class="absolute inset-0 bg-gradient-to-br from-background-dark via-background-dark to-[var(--category-color)] opacity-40"></div>
      <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern height="40" id="pattern-1" patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width="40">
            <path d="M 10,0 L 10,40 M 30,0 L 30,40" fill="none" opacity="0.3" stroke="var(--category-color)" stroke-width="0.5"></path>
          </pattern>
        </defs>
        <rect fill="url(#pattern-1)" height="100%" width="100%"></rect>
      </svg>
      <div class="relative h-full flex flex-col justify-center items-center p-8 sm:p-12 text-center">
        <h1 class="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter">${title}</h1>
        <p class="text-gray-300 text-lg font-normal leading-normal max-w-2xl">${desc}</p>
      </div>
    </div>
  `;
}
}

// Render shows and episodes (collapsible .show-box divs)
function renderShows(shows) {
  currentShows = {};
  cachedEpisodes = [];
  const showList = document.getElementById('show-list');
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
          const errorContainer2 = document.getElementById('errorContainer');
          if (errorContainer2) {
            errorContainer2.innerHTML += `<p>⚠️ Could not load episodes for ${showName}</p>`;
          }
        });
    } else if (show.episodes) {
      currentShows[showName] = show;
      renderShowBox(showName, show.description, show.episodes);
      show.episodes.forEach(ep => {
        cachedEpisodes.push({ ...ep, showName });
      });
    }
  });
}

// Render a pill-style player for a show/episode
function renderShowBox(showName, description, episodes) {
  const showList = document.getElementById('showList');
  const indicator = document.createElement('span');
  indicator.textContent = '\u25b6'; // Closed by default
  indicator.setAttribute('aria-label', 'Expand/collapse show');
  indicator.style.marginRight = '8px';
  indicator.style.transition = 'transform 0.2s';

  const showBox = document.createElement('div');
  showBox.className = 'show-box';

  const header = document.createElement('h2');
  header.className = 'show-title';
  header.tabIndex = 0;
  header.style.cursor = 'pointer';

  const instruction = document.createElement('span');
  instruction.textContent = ' (click to expand)';
  instruction.style.fontSize = '0.85em';
  instruction.style.color = '#888';

  header.addEventListener('focus', (e) => {
    if (e.detail === 0) {
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
  content.style.display = 'none';

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
    epTitle.className = 'episode-title';
    epTitle.textContent = episode.title;
    epTitle.title = episode.title;

    if (episode.url) {
      const audioPlayer = document.createElement('audio');
      audioPlayer.controls = true;
      audioPlayer.src = normalizeAudioUrl(episode.url);

      audioPlayer.addEventListener('play', () => {
        pauseAllAudioPlayers(audioPlayer); // exclude this player
        document.getElementById('marqueeText').textContent = `🎧 Now Playing: ${episode.title} from ${showName}`;
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

      const dismissBtn = document.createElement('span');
      dismissBtn.textContent = '\u2716';
      dismissBtn.className = 'dismiss-btn';
      dismissBtn.title = 'Remove';
      dismissBtn.style.marginLeft = '8px';
      dismissBtn.addEventListener('click', () => {
        epDiv.classList.remove('playing-now');
        audioPlayer.pause();
        document.getElementById('marqueeText').textContent = '';
        lastPlayingBlock = null;
      });

      epDiv.appendChild(epTitle);
      epDiv.appendChild(dismissBtn);
      epDiv.appendChild(audioPlayer);
    } else {
      const noAudio = document.createElement('span');
      noAudio.textContent = 'Audio unavailable';
      noAudio.className = 'no-audio';
      epDiv.appendChild(noAudio);
      epDiv.appendChild(epTitle);
    }

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

  if (cachedEpisodes.length > 0) {
    const random = cachedEpisodes[Math.floor(Math.random() * cachedEpisodes.length)];
    document.getElementById('marqueeText').textContent = `🎧 Surprise: ${random.title} from ${random.showName}`;

    const surpriseBlock = document.createElement('div');
    surpriseBlock.className = 'episode surprise-block';

    const epTitle = document.createElement('div');
    epTitle.className = 'episode-title';
    epTitle.textContent = random.title;
    epTitle.title = random.title;
    surpriseBlock.appendChild(epTitle);

    let audioPlayer;

    const dismissBtn = document.createElement('span');
    dismissBtn.textContent = '\u2716';
    dismissBtn.className = 'dismiss-btn';
    dismissBtn.title = 'Remove';
    dismissBtn.setAttribute('role', 'button');
    dismissBtn.tabIndex = 0;
    dismissBtn.style.marginLeft = '8px';

    const closeSurprise = () => {
      if (audioPlayer && !audioPlayer.paused) audioPlayer.pause();
      surpriseBlock.remove();
      const marquee = document.getElementById('marqueeText');
      if (marquee && marquee.textContent.startsWith('🎧 Surprise:')) {
        marquee.textContent = '';
      }
      if (lastPlayingBlock === surpriseBlock) lastPlayingBlock = null;
    };

    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSurprise();
    });
    dismissBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeSurprise();
      }
    });

    surpriseBlock.appendChild(dismissBtn);

    if (random.url) {
      audioPlayer = document.createElement('audio');
      audioPlayer.controls = true;
      audioPlayer.src = normalizeAudioUrl(random.url);

      audioPlayer.addEventListener('play', () => {
        pauseAllAudioPlayers(audioPlayer); // exclude this player
        document.getElementById('marqueeText').textContent = `🎧 Surprise: ${random.title} from ${random.showName}`;
        surpriseBlock.classList.add('playing-now');
        lastPlayingBlock = surpriseBlock;
      });
      audioPlayer.addEventListener('pause', () => {
        const marquee = document.getElementById('marqueeText');
        if (marquee && marquee.textContent.startsWith('🎧 Surprise:')) {
          marquee.textContent = '';
        }
        if (surpriseBlock.classList.contains('playing-now')) {
          surpriseBlock.classList.remove('playing-now');
          lastPlayingBlock = null;
        }
      });
      audioPlayer.addEventListener('ended', () => {
        const marquee = document.getElementById('marqueeText');
        if (marquee && marquee.textContent.startsWith('🎧 Surprise:')) {
          marquee.textContent = '';
        }
        if (surpriseBlock.classList.contains('playing-now')) {
          surpriseBlock.classList.remove('playing-now');
          lastPlayingBlock = null;
        }
      });

      surpriseBlock.appendChild(audioPlayer);

      setTimeout(() => {
        audioPlayer.play().catch(() => {
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

window.onload = function() {
  loadGenre(currentGenre);
};

document.getElementById('genreSelect').addEventListener('change', function() {
  loadGenre(this.value);
});
