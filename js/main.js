document.addEventListener('DOMContentLoaded', () => {
  const bubbleContainer = document.getElementById('bubbleContainer');
  const addBubbleBtn = document.getElementById('addBubbleBtn');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const promptOutput = document.getElementById('promptOutput');
  const safeModeCheckbox = document.getElementById('safeMode');

  if (addBubbleBtn) {
    addBubbleBtn.addEventListener('click', () => {
      addBubble();
    });
  }

  if (generatePromptBtn) {
    generatePromptBtn.addEventListener('click', () => {
      generatePrompt();
    });
  }

  if (safeModeCheckbox) {
    safeModeCheckbox.addEventListener('change', () => {
      checkModel();
    });
  }

  const closeBtn = document.querySelector('#welcomeBox .close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('welcomeBox').style.display = 'none';
    });
  }

  // Populate dropdowns on load
  populateSelect(document.getElementById('platform'), 'platforms.json');
  populateSelect(document.getElementById('style'), 'styles.json');
  populateSelect(document.getElementById('aspect'), 'aspect-ratios.json');
  populateSelect(document.getElementById('qualityPackOptions'), 'quality-packs.json');
  populateSelect(document.getElementById('negativePackOptions'), 'negative-terms.json');

  function addBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const typeSelect = document.createElement('select');
    typeSelect.className = 'type-select';
    populateSelect(typeSelect, 'bubble-types.json');

    const valueSelect = document.createElement('select');
    valueSelect.className = 'value-select';

    typeSelect.addEventListener('change', () => {
      updateBubbleOptions(bubble, typeSelect.value);
    });

    const lockBtn = document.createElement('button');
    lockBtn.className = 'lock-btn';
    lockBtn.textContent = '🔓';
    lockBtn.setAttribute('aria-label', 'Lock bubble');
    lockBtn.addEventListener('click', () => {
      const isLocked = lockBtn.textContent === '🔒';
      lockBtn.textContent = isLocked ? '🔓' : '🔒';
      lockBtn.setAttribute('aria-label', isLocked ? 'Lock bubble' : 'Unlock bubble');
      bubble.classList.toggle('locked');
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✖';
    removeBtn.setAttribute('aria-label', 'Remove bubble');
    removeBtn.addEventListener('click', () => {
      bubble.remove();
    });

    bubble.appendChild(typeSelect);
    bubble.appendChild(valueSelect);
    bubble.appendChild(lockBtn);
    bubble.appendChild(removeBtn);
    bubbleContainer.appendChild(bubble);
  }

  function generatePrompt() {
    const bubbles = document.querySelectorAll('.bubble');
    const promptParts = [];

    bubbles.forEach(bubble => {
      const type = bubble.querySelector('.type-select').value;
      const value = bubble.querySelector('.value-select').value;
      const locked = bubble.classList.contains('locked');
      if (type && value) {
        const part = locked ? `(${value})` : value;
        promptParts.push(part);
      }
    });

    promptOutput.textContent = promptParts.join(', ');
  }
});
