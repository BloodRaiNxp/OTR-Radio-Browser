/*
  PromptBuilder.Xp
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
  Description: A platform-agnostic AI art and video prompt generator
*/

document.addEventListener('DOMContentLoaded', () => {
  const manualToggle = document.getElementById('manualToggle');
  const manualPromptSection = document.getElementById('manualPromptSection');
  const blockPromptSection = document.getElementById('blockPromptSection');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const promptOutput = document.getElementById('promptOutput');
  const safeModeCheckbox = document.getElementById('safeMode');
  const negativePrompt = document.getElementById('negativePrompt');
  const negativeHelper = document.getElementById('negativeHelper');

  const applyWeighting = document.getElementById('applyWeighting');
  const preserveCasing = document.getElementById('preserveCasing');

  // Toggle between manual and block mode
  manualToggle?.addEventListener('change', () => {
    const useManual = manualToggle.checked;
    manualPromptSection.style.display = useManual ? 'block' : 'none';
    blockPromptSection.style.display = useManual ? 'none' : 'block';
  });

  // Format modifiers with weighting and casing
  function formatModifiers(modifiers, applyWeighting, preserveCasing) {
    return modifiers.map(mod => {
      let term = preserveCasing ? mod : mod.toLowerCase();
      return applyWeighting ? `(${term})` : term;
    });
  }

  // Get selected enhancement modifiers
  function getSelectedModifiers() {
    const qualitySelect = document.getElementById('quality');
    const selected = Array.from(qualitySelect?.selectedOptions || []).map(opt => opt.value);
    return formatModifiers(selected, applyWeighting?.checked, preserveCasing?.checked);
  }

  // Generate prompt
  generatePromptBtn?.addEventListener('click', () => {
    let prompt = '';

    if (manualToggle.checked) {
      prompt = document.getElementById('manualPrompt')?.value || '';
    } else {
      const blocks = [
        'imageType',
        'subject',
        'action',
        'descriptors',
        'environment'
      ];
      const parts = blocks.map(id => {
        const el = document.getElementById(id);
        return el?.value || '';
      }).filter(Boolean);

      const modifiers = getSelectedModifiers();
      const fullPrompt = [...parts, ...modifiers].join(', ');
      prompt = fullPrompt;
    }

    // Safe mode scan
    if (safeModeCheckbox?.checked && negativePrompt && negativeHelper) {
      const flaggedWords = [
        "nsfw", "gore", "nudity", "violence", "explicit", "titts", "blood", "kill", "rape"
      ];
      const input = negativePrompt.value.toLowerCase();
      const detected = flaggedWords.filter(word => input.includes(word));
      if (detected.length > 0) {
        negativeHelper.textContent = `⚠️ Prompt hidden due to flagged terms: ${detected.join(", ")}`;
        promptOutput.textContent = '';
        return;
      } else {
        negativeHelper.textContent = '';
      }
    }

    promptOutput.textContent = prompt;
  });

  // Welcome box close
  const closeBtn = document.querySelector('#welcomeBox .close-btn');
  closeBtn?.addEventListener('click', () => {
    document.getElementById('welcomeBox').style.display = 'none';
  });

  // Populate dropdowns
  populateSelect(document.getElementById('imageType'), 'image-types.json');
  populateSelect(document.getElementById('subject'), 'subjects.json');
  populateSelect(document.getElementById('action'), 'actions.json');
  populateSelect(document.getElementById('descriptors'), 'descriptors.json');
  populateSelect(document.getElementById('quality'), 'quality-packs.json');
  populateSelect(document.getElementById('environment'), 'environments.json');
});
