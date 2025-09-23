/*
  PromptBuilder.Xp
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
  Description: A platform-agnostic AI art and video prompt generator
*/

function populateSelect(selectElement, jsonFile) {
  fetch(`data/${jsonFile}`)
    .then(response => response.json())
    .then(data => {
      selectElement.innerHTML = '';

      if (Array.isArray(data)) {
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.value || item;
          option.textContent = item.label || item;
          selectElement.appendChild(option);
        });
      } else if (typeof data === 'object') {
        Object.entries(data).forEach(([key, values]) => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = key;

          values.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value || item;
            option.textContent = item.label || item;
            optgroup.appendChild(option);
          });

          selectElement.appendChild(optgroup);
        });
      } else {
        selectElement.innerHTML = '<option disabled>Invalid data format</option>';
        console.error(`Unexpected data format in ${jsonFile}`);
      }
    })
    .catch(error => {
      selectElement.innerHTML = '<option disabled>Error loading options</option>';
      console.error(`Error loading ${jsonFile}:`, error);
    });
}

function toggleDarkMode() {
  const isDarkMode = document.getElementById('darkModeToggle')?.checked;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function checkModel() {
  const safeMode = document.getElementById('safeMode');
  const negativePrompt = document.getElementById('negativePrompt');
  const negativeHelper = document.getElementById('negativeHelper');

  if (!safeMode || !negativePrompt || !negativeHelper) return;

  const flaggedWords = [
    "nsfw", "gore", "nudity", "violence", "explicit", "titts", "blood", "kill", "rape"
  ];
  const input = negativePrompt.value.toLowerCase();

  if (safeMode.checked) {
    const detected = flaggedWords.filter(word => input.includes(word));
    negativeHelper.textContent = detected.length > 0
      ? `⚠️ Prompt hidden due to flagged terms: ${detected.join(", ")}`
      : '';
  } else {
    negativeHelper.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const darkToggle = document.getElementById('darkModeToggle');
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    if (darkToggle) darkToggle.checked = true;
  }

  darkToggle?.addEventListener('change', toggleDarkMode);
});
