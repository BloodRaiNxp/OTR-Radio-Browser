function populateSelect(selectElement, jsonFile) {
  fetch(`data/${jsonFile}`)
    .then(response => response.json())
    .then(data => {
      selectElement.innerHTML = '';

      if (Array.isArray(data)) {
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.value;
          option.textContent = item.label;
          selectElement.appendChild(option);
        });
      } else if (typeof data === 'object') {
        Object.entries(data).forEach(([key, values]) => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = key;

          values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
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
  const isDarkMode = document.getElementById('darkModeToggle').checked;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function checkModel() {
  const safeMode = document.getElementById('safeMode');
  const negativePrompt = document.getElementById('negativePrompt');
  const negativeHelper = document.getElementById('negativeHelper');

  if (!safeMode || !negativePrompt || !negativeHelper) return;

  const flaggedWords = ['nsfw', 'gore', 'nudity', 'violence', 'explicit'];
  const input = negativePrompt.value.toLowerCase();

  if (safeMode.checked) {
    const flagged = flaggedWords.filter(word => input.includes(word));
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
  const darkToggle = document.getElementById('darkModeToggle');
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    if (darkToggle) darkToggle.checked = true;
  }

  if (darkToggle) {
    darkToggle.addEventListener('change', toggleDarkMode);
  }
});
