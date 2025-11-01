// Wire up Share This Webpage dropdown copy icon on home screen
document.addEventListener('DOMContentLoaded', () => {
  // Find the share dropdown input and copy icon
  const shareDropdown = document.querySelector('.group .absolute input[type="text"]');
  const copyBtn = document.querySelector('.group .absolute button span.material-symbols-outlined');
  if (shareDropdown && copyBtn) {
    // Set the input value to the current page URL
    shareDropdown.value = window.location.href;
    copyBtn.parentElement.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(shareDropdown.value).then(() => {
        copyBtn.textContent = 'done';
        setTimeout(() => {
          copyBtn.textContent = 'content_copy';
        }, 1200);
      });
    });
  }
});
// Episode Playback Page wiring
function setupEpisodePlayback() {
  const params = new URLSearchParams(window.location.search);
  const categoryKey = params.get('category');
  const showName = params.get('show');
  const episodeTitle = decodeURIComponent(params.get('episode') || '');
  if (!categoryKey || !showName || !episodeTitle) return;

  // Fetch show data
  fetch(`../data/${categoryKey}.json`).then(res => res.json()).then(data => {
    const show = data.shows[showName];
    if (!show) return;
    // Fetch episodes
    const loadEpisodes = show.source ? fetch(`../${show.source}`).then(r => r.json()) : Promise.resolve(show.episodes);
    loadEpisodes.then(episodes => {
      const ep = episodes.find(e => e.title === episodeTitle);
      if (!ep) return;
      renderPlayer(showName, ep, categoryKey);
    });
  });
}

function renderPlayer(showName, ep, categoryKey) {
  const root = document.getElementById('player-root');
  root.innerHTML = `
    <div class='flex flex-col items-center justify-center min-h-screen bg-background-dark'>
      <div class='w-full max-w-2xl bg-surface-dark rounded-2xl shadow-lg p-8 flex flex-col items-center'>
        <h2 class='text-3xl font-bold mb-2 text-center'>${showName}</h2>
        <h3 class='text-xl font-medium mb-6 text-center'>${ep.title}</h3>
        <audio id='audio-player' src='${ep.url}' controls class='w-full mb-4'></audio>
        <div class='flex items-center gap-4'>
          <button id='back-btn' class='text-white bg-primary rounded-full p-3'><span class='material-symbols-outlined'>arrow_back</span></button>
          <button id='share-btn' class='text-white bg-primary rounded-full p-3'><span class='material-symbols-outlined'>share</span></button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('back-btn').onclick = () => history.back();
  document.getElementById('share-btn').onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
}

if (window.location.pathname.endsWith('episode_playback.html')) {
  document.addEventListener('DOMContentLoaded', setupEpisodePlayback);
}
// Info Page wiring
function setupInfoPage() {
  // Wire up Explore Collection button
  const exploreBtn = document.querySelector('button');
  if (exploreBtn && exploreBtn.textContent.includes('Explore Collection')) {
    exploreBtn.addEventListener('click', () => {
      goTo('home_screen.html');
    });
  }
}

if (window.location.pathname.endsWith('info_page.html')) {
  document.addEventListener('DOMContentLoaded', setupInfoPage);
}
// Category Page wiring
function setupCategoryPage() {
  // Get category from URL
  const params = new URLSearchParams(window.location.search);
  const categoryKey = params.get('category');
  if (!categoryKey) return;

  // Map category key to file name
  const categoryMap = {
    'sci-fi': 'sci-fi',
    'detectives': 'detectives',
    'suspense-and-horror': 'suspense-and-horror',
    'westerns': 'westerns',
    'comedies': 'comedies'
  };
  const fileKey = categoryMap[categoryKey] || categoryKey;

  // Define categories
  const categories = [
    { key: 'sci-fi', name: 'Sci-Fi' },
    { key: 'detectives', name: 'Detectives' },
    { key: 'suspense-and-horror', name: 'Suspense & Horror' },
    { key: 'westerns', name: 'Westerns' },
    { key: 'comedies', name: 'Comedies' }
  ];

  // Populate category nav
  const navContainer = document.getElementById('category-nav-container');
  if (navContainer) {
    navContainer.innerHTML = `
      <div class="mb-8 bg-surface-dark rounded-xl p-2 flex justify-center">
        <nav class="relative flex items-center gap-2 overflow-x-auto" id="category-nav">
          <div id="nav-pill" class="absolute bg-primary rounded-full h-10 transition-all duration-300 ease-in-out shadow-lg" style="width: 0px; left: 0px;"></div>
          ${categories.map(cat => `<a class="relative z-10 px-4 py-2 text-sm font-medium leading-normal transition-colors rounded-full" href="#" data-category="${cat.key}">${cat.name}</a>`).join('')}
        </nav>
      </div>
    `;

    // Set active
    const nav = document.getElementById('category-nav');
    const activeLink = nav.querySelector(`[data-category="${categoryKey}"]`);
    if (activeLink) {
      activeLink.classList.add('text-background-dark', 'bg-primary', 'font-bold', 'shadow-lg', 'shadow-primary/20');
      // Move pill to active
      const pill = document.getElementById('nav-pill');
      const rect = activeLink.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      pill.style.width = rect.width + 'px';
      pill.style.left = (rect.left - navRect.left) + 'px';
    }

    // Add hover for pill movement
    const links = nav.querySelectorAll('a[data-category]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const pill = document.getElementById('nav-pill');
        const rect = link.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        pill.style.width = rect.width + 'px';
        pill.style.left = (rect.left - navRect.left) + 'px';
      });
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-category');
        window.location.href = `category_page.html?category=${cat}`;
      });
    });
  }

  // Set header
  const header = document.getElementById('category-header');
  if (header) {
    header.innerHTML = `<div class='relative w-full h-80 rounded-xl overflow-hidden mb-12'>
      <div class='absolute inset-0 bg-gradient-to-br from-background-dark via-background-dark to-[var(--category-color)] opacity-40'></div>
      <svg class='absolute inset-0 w-full h-full' xmlns='http://www.w3.org/2000/svg'><defs><pattern height='40' id='pattern-1' patternTransform='rotate(45)' patternUnits='userSpaceOnUse' width='40'><path d='M 10,0 L 10,40 M 30,0 L 30,40' fill='none' opacity='0.3' stroke='var(--category-color)' stroke-width='0.5'></path></pattern></defs><rect fill='url(#pattern-1)' height='100%' width='100%'></rect></svg>
      <div class='relative h-full flex flex-col justify-center items-center p-8 sm:p-12 text-center'>
        <h1 class='text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter'>${categories.find(c => c.key === categoryKey)?.name || ''}</h1>
        <p class='text-gray-300 text-lg font-normal leading-normal max-w-2xl'>Browse classic radio shows in this category.</p>
      </div>
    </div>`;
  }

  // Load shows for this category
  fetch(`../data/${categoryKey}.json`)
    .then(res => res.json())
    .then(data => {
      const showList = document.getElementById('show-list');
      showList.innerHTML = '';
      Object.entries(data.shows).forEach(([showName, show]) => {
        // Each show: expandable details
        const details = document.createElement('details');
        details.className = 'flex flex-col group bg-surface-dark rounded-xl';
        const summary = document.createElement('summary');
        summary.className = 'flex cursor-pointer items-center justify-between gap-6 py-4 px-6 list-none';
        summary.innerHTML = `<div class='flex items-center gap-4'><span class='material-symbols-outlined text-[var(--category-color)] text-2xl'>radio</span><p class='text-white text-lg font-medium leading-normal'>${showName}</p></div><div class='text-gray-400 group-open:rotate-180 transition-transform'><span class='material-symbols-outlined'>expand_more</span></div>`;
        details.appendChild(summary);
        const content = document.createElement('div');
        content.className = 'pl-8 pr-6 pt-2 pb-4';
        // Load episodes
        if (show.source) {
          fetch(`../${show.source}`)
            .then(res => res.json())
            .then(episodes => {
              content.appendChild(renderEpisodeList(episodes, showName, categoryKey));
            });
        } else if (show.episodes) {
          content.appendChild(renderEpisodeList(show.episodes, showName, categoryKey));
        }
        details.appendChild(content);
        showList.appendChild(details);
      });
    });
}

function renderEpisodeList(episodes, showName, categoryKey) {
  const container = document.createElement('div');
  container.className = 'max-h-72 overflow-y-auto space-y-1 pr-2 border-l border-white/10';
  episodes.slice(0, 20).forEach(ep => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-4 hover:bg-white/5 px-4 min-h-14 justify-between rounded-lg ml-6';
    const left = document.createElement('div');
    left.className = 'flex items-center gap-4 min-w-0';
    const btn = document.createElement('button');
    btn.className = 'text-white flex items-center justify-center rounded-lg bg-white/10 shrink-0 size-10';
    btn.innerHTML = '<span class="material-symbols-outlined icon-filled">play_circle</span>';
    btn.addEventListener('click', () => {
      goTo('episode_playback.html', { category: categoryKey, show: showName, episode: encodeURIComponent(ep.title) });
    });
    left.appendChild(btn);
    const title = document.createElement('p');
    title.className = 'text-white text-base font-normal leading-normal flex-1 truncate';
    title.textContent = ep.title;
    left.appendChild(title);
    row.appendChild(left);
    container.appendChild(row);
  });
  return container;
}

if (window.location.pathname.endsWith('category_page.html')) {
  document.addEventListener('DOMContentLoaded', setupCategoryPage);
}
// main.js - Dynamic wiring for Classic Radio Theater UI

// Category definitions (match your data files)
const categories = [
  { key: 'comedies', name: 'Comedies' },
  { key: 'detectives', name: 'Detectives' },
  { key: 'sci-fi', name: 'Sci-Fi' },
  { key: 'suspense-and-horror', name: 'Suspense-and-Horror' },
  { key: 'westerns', name: 'Westerns' }
];

// Helper: navigate to a new page with query params
function goTo(page, params = {}) {
  const url = new URL(page, window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  window.location.href = url.toString();
}

// Home Screen wiring
function setupHomeScreen() {
  // Hardcode categories for now
  const categories = [
    { key: 'sci-fi', name: 'Sci-Fi' },
    { key: 'detectives', name: 'Detectives' },
    { key: 'suspense-and-horror', name: 'Suspense & Horror' },
    { key: 'westerns', name: 'Westerns' },
    { key: 'comedies', name: 'Comedies' }
  ];
  
  // Category nav bar
  const nav = document.getElementById('category-nav');
  if (nav) {
    nav.innerHTML = `
      <div id="nav-pill" class="absolute bg-primary rounded-full h-10 transition-all duration-300 ease-in-out shadow-lg" style="width: 0px; left: 0px;"></div>
      ${categories.map(cat => `<a class="relative z-10 px-5 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full" href="#" data-category="${cat.key}">${cat.name}</a>`).join('')}
    `;
    nav.classList.add('relative');

    // Add hover for pill movement
    const links = nav.querySelectorAll('a[data-category]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const pill = document.getElementById('nav-pill');
        const rect = link.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        pill.style.width = rect.width + 'px';
        pill.style.left = (rect.left - navRect.left) + 'px';
      });
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-category');
        goTo('category_page.html', { category: cat });
      });
    });
  }

  // Info link
  document.querySelectorAll('a,button').forEach(el => {
    if (el.textContent && el.textContent.trim().toLowerCase().includes('info')) {
      el.addEventListener('click', e => {
        e.preventDefault();
        goTo('info_page.html');
      });
    }
    if (el.textContent && el.textContent.trim().toLowerCase().includes('home')) {
      el.addEventListener('click', e => {
        e.preventDefault();
        goTo('home_screen.html');
      });
    }
  });

  // Wire up hero buttons
  const heroSection = document.querySelector('.relative.w-full.h-\\[550px\\]');
  if (heroSection) {
    const buttons = heroSection.querySelectorAll('button');
    if (buttons.length >= 2) {
      const listenNow = buttons[0];
      const learnMore = buttons[1];
      listenNow.addEventListener('click', () => {
        // Example: go to episode for The Shadow
        goTo('episode_playback.html', { category: 'detectives', show: 'the-shadow', episode: 'The Case of the Missing Heiress' });
      });
      learnMore.addEventListener('click', () => {
        goTo('info_page.html');
      });
    }
  }

  // Wire up show cards
  const showCards = document.querySelectorAll('.flex.flex-col.gap-4.rounded-xl');
  showCards.forEach(card => {
    const button = card.querySelector('button');
    const title = card.querySelector('p.text-white.text-xl').textContent;
    // Map hardcoded titles to actual show names and first episodes
    const showMap = {
      'X Minus One': { show: 'x-minus-one', episode: 'xminusone 550422 andthemoonbestillandbright' },
      'Fibber McGee and Molly': { show: 'blondie', episode: 'Dagwood\'s Diet' }, // Use blondie as comedy example
      'Suspense': { show: 'inner-sanctum', episode: 'The Amazing Death of Mrs. Putnam' }
    };
    const mapped = showMap[title];
    if (mapped) {
      button.addEventListener('click', () => {
        let category = 'sci-fi'; // default
        if (title.includes('Fibber') || title.includes('Blondie')) category = 'comedies';
        if (title.includes('Suspense')) category = 'suspense-and-horror';
        goTo('episode_playback.html', { category, show: mapped.show, episode: encodeURIComponent(mapped.episode) });
      });
    }
  });
}

// Detect which page we're on and run setup
if (window.location.pathname.endsWith('home_screen.html') || window.location.pathname.endsWith('index.html')) {
  document.addEventListener('DOMContentLoaded', setupHomeScreen);
}
