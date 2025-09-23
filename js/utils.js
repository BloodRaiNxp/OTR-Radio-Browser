function populateSelect(selectElement, jsonFile) {
  fetch(`data/${jsonFile}`)
    .then(response => response.json())
    .then(data => {
      selectElement.innerHTML = '';
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        selectElement.appendChild(option);
      });
    })
    .catch(error => {
      console.error(`Error loading ${jsonFile}:`, error);
    });
}

function toggleDarkMode() {
  const isDarkMode = document.getElementById('darkModeToggle').checked;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function checkModel() {
  const safeMode = document.getElementById('safeMode').checked;
  const negativePrompt = document.getElementById('negativePrompt').value.toLowerCase();
  const flaggedWords = ['nsfw', 'gore', 'nudity', 'violence', 'explicit'];
  const negativeHelper = document.getElementById('negativeHelper');

  if (safeMode) {
    const flagged = flaggedWords.filter(word => negativePrompt.includes(word));
    if (flagged.length > 0) {
      negativeHelper.textContent = `⚠️ Contains flagged terms: ${flagged.join(', ')}`;
    } else {
      negativeHelper.textContent = '';
    }
  } else {
    negativeHelper.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').checked = true;
  }

  document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
});
