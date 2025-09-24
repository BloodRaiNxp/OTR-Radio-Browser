/*
  PromptBuilder.Xp
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
  Description: A platform-agnostic AI art and video prompt generator
*/

let FLAGGED_WORDS = null;

export async function loadFlaggedWords() {
  if (FLAGGED_WORDS) return FLAGGED_WORDS;
  try {
    const res = await fetch('data/flagged-words.json');
    FLAGGED_WORDS = await res.json();
  } catch (e) {
    console.warn('Could not load flagged words', e);
    FLAGGED_WORDS = ["nsfw", "gore", "nudity", "violence"]; // fallback
  }
  return FLAGGED_WORDS;
}

export function detectFlaggedTerms(text) {
  if (!text) return [];
  const words = text.toLowerCase();
  const flagged = (FLAGGED_WORDS || []).filter(w => {
    const safeW = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
    const re = new RegExp('\\b' + safeW + '\\b', 'i'); // word boundary
    return re.test(words);
  });
  return flagged;
}

export async function populateSelect(selectEl, jsonPath) {
  try {
    const res = await fetch(`data/${jsonPath}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      data.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.value || item;
        opt.textContent = item.label || item;
        selectEl.appendChild(opt);
      });
    } else {
      Object.entries(data).forEach(([group, items]) => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = group;
        items.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.value || item;
          opt.textContent = item.label || item;
          optGroup.appendChild(opt);
        });
        selectEl.appendChild(optGroup);
      });
    }
  } catch {
    const fallback = document.createElement('option');
    fallback.textContent = '⚠️ Failed to load options';
    fallback.disabled = true;
    selectEl.appendChild(fallback);
  }
}
