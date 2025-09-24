/*
  PromptBuilder.Xp
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
  Description: A platform-agnostic AI art and video prompt generator
*/

document.addEventListener('DOMContentLoaded', () => {
  const manualToggle = document.getElementById('manualToggle');
  const manualPrompt = document.getElementById('manualPrompt');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const clearBtn = document.getElementById('clearBtn');
  const promptOutput = document.getElementById('promptOutput');
  const safeModeCheckbox = document.getElementById('safeMode');
  const negativePrompt = document.getElementById('negativePrompt');
  const negativeHelper = document.getElementById('negativeHelper');

  const modelSelect = document.getElementById('modelSelect');
  const aspectRatio = document.getElementById('aspectRatio');

  const applyWeighting = document.getElementById('applyWeighting');
  const preserveCasing = document.getElementById('preserveCasing');

  // Format modifiers with weighting and casing
  function formatModifiers(modifiers, applyWeighting, preserveCasing) {
    return modifiers.map(mod => {
      let term = preserveCasing ? mod : mod.toLowerCase();
      return applyWeighting ? `(${term})` : term;
    });
  }

  // Get selected values from multi-selects
  function getMultiSelectValues(id) {
    const el = document.getElementById(id);
    return Array.from(el?.selectedOptions || []).map(opt => opt.value);
  }

  // Generate prompt
  generatePromptBtn?.addEventListener('click', () => {
    let prompt = '';

    if (manualToggle?.checked) {
      prompt = manualPrompt?.value || '';
    } else {
      const blocks = [
        'imageType',
        'subject',
        'action',
        'environment'
      ].map(id => document.getElementById(id)?.value || '');

      const descriptors = getMultiSelectValues('descriptors');
      const quality = getMultiSelectValues('quality');
      const modifiers = formatModifiers([...descriptors, ...quality], applyWeighting?.checked, preserveCasing?.checked);

      prompt = [...blocks, ...modifiers].filter(Boolean).join(', ');
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

    const model = modelSelect?.value || 'Unknown Model';
    const aspect = aspectRatio?.value || 'Unknown Ratio';

    const finalOutput = `Model: ${model}\nAspect Ratio: ${aspect}\n\nPrompt:\n${prompt}`;
    promptOutput.textContent = finalOutput;
  });

  // Clear all inputs
  clearBtn?.addEventListener('click', () => {
    manualPrompt.value = '';
    negativePrompt.value = '';
    promptOutput.textContent = '';
    negativeHelper.textContent = '';
  });

  // Populate dropdowns
  populateSelect(modelSelect, 'platforms.json');
  populateSelect(aspectRatio, 'aspect-ratios.json');
  populateSelect(document.getElementById('imageType'), 'image-types.json');
  populateSelect(document.getElementById('subject'), 'subjects.json');
  populateSelect(document.getElementById('action'), 'actions.json');
  populateSelect(document.getElementById('environment'), 'environments.json');
  populateSelect(document.getElementById('descriptors'), 'descriptors.json');
  populateSelect(document.getElementById('quality'), 'quality-packs.json');
});
