document.addEventListener('DOMContentLoaded', () => {
  const bubbleContainer = document.getElementById('bubbleContainer');
  const addBubbleBtn = document.getElementById('addBubbleBtn');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const promptOutput = document.getElementById('promptOutput');
  const safeModeToggle = document.getElementById('safeModeToggle');

  addBubbleBtn.addEventListener('click', () => {
    addBubble();
  });

  generatePromptBtn.addEventListener('click', () => {
    generatePrompt();
  });

  safeModeToggle.addEventListener('change', () => {
    checkModel();
  });

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
