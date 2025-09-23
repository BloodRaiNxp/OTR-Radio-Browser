/*
  PromptBuilder.Xp - Main Logic
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
*/
document.addEventListener('DOMContentLoaded', async () => {
  const platforms = await fetch('data/platforms.json').then(res => res.json());
  const styles = await fetch('data/styles.json').then(res => res.json());
  const aspects = await fetch('data/aspect-ratios.json').then(res => res.json());
  const qualityPacks = await fetch('data/quality-packs.json').then(res => res.json());
  const negativeTerms = await fetch('data/negative-terms.json').then(res => res.json());
  const bubbleTypes = await fetch('data/bubble-types.json').then(res => res.json());

  // Populate dropdowns
  populateSelect('platform', platforms.map(p => ({ value: p.id, label: p.name })));
  populateSelect('style', styles, true);
  populateSelect('aspect', aspects);
  populateSelect('qualityPackOptions', qualityPacks, false, true);
  populateSelect('negativePackOptions', negativeTerms, false, false); // Set isGrouped = false

  // Initialize bubble system with one default bubble
  const bubbleContainer = document.getElementById('promptBuilder');
  addBubble(bubbleContainer, bubbleTypes);

  // Event listeners
  document.getElementById('platform').addEventListener('change', () => {
    const platformId = document.getElementById('platform').value;
    const platform = platforms.find(p => p.id === platformId);
    const modelSelect = document.getElementById('model');
    modelSelect.innerHTML = '';
    if (platform) {
      populateSelect('model', platform.models);
      modelSelect.disabled = false;
    } else {
      modelSelect.innerHTML = '<option value="" disabled selected>Select a platform first</option>';
      modelSelect.disabled = true;
    }
    checkModel();
  });

  document.getElementById('model').addEventListener('change', checkModel);
  document.getElementById('promptType').addEventListener('change', () => {
    updateBubbleOptions(bubbleContainer, bubbleTypes);
  });
  document.getElementById('generateBtn').addEventListener('click', generatePrompt);
  document.getElementById('copyBtn').addEventListener('click', copyPrompt);
  document.getElementById('randomPromptBtn').addEventListener('click', () => randomizePrompt(bubbleContainer, bubbleTypes));
  document.getElementById('addBubbleBtn').addEventListener('click', () => addBubble(bubbleContainer, bubbleTypes));
  document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
  document.getElementById('welcomeBox').querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('welcomeBox').style.display = 'none';
  });

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').checked = true;
  }
});

function populateSelect(id, data, hasPlaceholder = false, isGrouped = false) {
  const select = document.getElementById(id);
  if (hasPlaceholder) {
    const option = document.createElement('option');
    option.value = '';
    option.disabled = true;
    option.selected = true;
    option.textContent = 'Select an option';
    select.appendChild(option);
  }
  if (isGrouped) {
    for (const group in data) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      data[group].forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    }
  } else {
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }
}

function addBubble(container, bubbleTypes) {
  const promptType = document.getElementById('promptType').value;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const typeSelect = document.createElement('select');
  typeSelect.innerHTML = '<option value="" disabled selected>Select type</option>';
  bubbleTypes.types.forEach(type => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.label;
    typeSelect.appendChild(option);
  });
  typeSelect.addEventListener('change', () => updateBubbleOptions(container, bubbleTypes));
  const valueSelect = document.createElement('select');
  valueSelect.innerHTML = '<option value="" disabled selected>Select value</option>';
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = 'X';
  removeBtn.setAttribute('aria-label', 'Remove bubble');
  removeBtn.addEventListener('click', () => bubble.remove());
  const lockBtn = document.createElement('button');
  lockBtn.className = 'lock-btn';
  lockBtn.textContent = '🔒';
  lockBtn.setAttribute('aria-label', 'Lock bubble');
  lockBtn.addEventListener('click', () => {
    lockBtn.classList.toggle('locked');
    lockBtn.textContent = lockBtn.classList.contains('locked') ? '🔒' : '🔓';
    lockBtn.setAttribute('aria-label', lockBtn.classList.contains('locked') ? 'Unlock bubble' : 'Lock bubble');
  });
  bubble.appendChild(typeSelect);
  bubble.appendChild(valueSelect);
  bubble.appendChild(removeBtn);
  bubble.appendChild(lockBtn);
  container.appendChild(bubble);
}

async function updateBubbleOptions(container, bubbleTypes) {
  const promptType = document.getElementById('promptType').value;
  const videoOptions = await fetch('data/video-options.json').then(res => res.json());
  const bubbles = container.querySelectorAll('.bubble');
  bubbles.forEach(bubble => {
    const typeSelect = bubble.querySelector('select');
    const type = typeSelect.value;
    const valueSelect = bubble.querySelectorAll('select')[1];
    if (type) {
      const options = promptType === 'video' && type === 'camera' ? videoOptions.camera : bubbleTypes[type] || [];
      valueSelect.innerHTML = '<option value="" disabled selected>Select value</option>';
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        valueSelect.appendChild(option);
      });
    }
  });
}
