/*
  PromptBuilder.Xp
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
  Description: A platform-agnostic AI art and video prompt generator
*/

import {
  populateSelect,
  loadFlaggedWords,
  detectFlaggedTerms
} from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const modelSelect = document.getElementById('modelSelect');
  const aspectRatio = document.getElementById('aspectRatio');
  const manualToggle = document.getElementById('manualToggle');
  const manualPrompt = document.getElementById('manualPrompt');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const clearBtn = document.getElementById('clearBtn');
  const promptOutput = document.getElementById('promptOutput');
  const negativePrompt = document.getElementById('negativePrompt');
  const negativeHelper = document.getElementById('negativeHelper');
  const safeModeCheckbox = document.getElementById('safeMode');
  const applyWeighting = document.getElementById('applyWeighting');
  const preserveCasing = document.getElementById('preserveCasing');
  const darkModeToggle = document.getElementById('darkModeToggle');

  let modelCapabilities = {};

  // Load model metadata
  async function loadModelCapabilities() {
    try {
      const res = await fetch('data/models.json');
      modelCapabilities = await res.json();

      // Populate modelSelect manually from keys
      modelSelect.innerHTML = '';
      Object.keys(modelCapabilities).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        modelSelect.appendChild(opt);
      });

      // Restore last-used model
      const lastModel = localStorage.getItem('pbxp.model');
      if (lastModel && modelCapabilities[lastModel]) {
        modelSelect.value = lastModel;
      }

      updateAspectOptions(modelSelect.value);
    } catch (e) {
      console.warn('Could not load model metadata', e);
      modelCapabilities = {};
    }
  }

  function updateAspectOptions(modelName) {
    const capabilities = modelCapabilities[modelName];
    aspectRatio.innerHTML = '';
    if (capabilities?.supportsAspectRatios) {
      capabilities.supportsAspectRatios.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        aspectRatio.appendChild(opt);
      });
    }
  }

  function formatModifiers(modifiers, applyWeighting, preserveCasing) {
    return modifiers.map(mod => {
      let term = preserveCasing ? mod : mod.toLowerCase();
      return applyWeighting ? `(${term})` : term;
    });
  }

  function getMultiSelectValues(id) {
    const el = document.getElementById(id);
    return Array.from(el?.selectedOptions || []).map(opt => opt.value);
  }

  generatePromptBtn?.addEventListener('click', async () => {
    await loadFlaggedWords();

    let prompt = '';

    if (manualToggle?.checked) {
      prompt = manualPrompt?.value || '';
    } else {
      const blocks = ['imageType', 'subject', 'action', 'environment']
        .map(id => document.getElementById(id)?.value || '');

      const descriptors = getMultiSelectValues('descriptors');
      const quality = getMultiSelectValues('quality');
      const modifiers = formatModifiers([...descriptors, ...quality], applyWeighting?.checked, preserveCasing?.checked);

      prompt = [...blocks, ...modifiers].filter(Boolean).join(', ');
    }

    const model = modelSelect?.value || 'Unknown Model';
    const aspect = aspectRatio?.value || 'Unknown Ratio';
    const capabilities = modelCapabilities?.[model] || {};

    localStorage.setItem('pbxp.model', model);
    localStorage.setItem('pbxp.aspect', aspect);

    if (safeModeCheckbox?.checked && capabilities.supportsNegative && negativePrompt?.value) {
      const detected = detectFlaggedTerms(negativePrompt.value);
      if (detected.length > 0) {
        negativeHelper.textContent = `⚠️ Prompt hidden due to flagged terms: ${detected.join(", ")}`;
        promptOutput.textContent = '';
        return;
      } else {
        negativeHelper.textContent = '';
      }
    }

    const finalOutput = `Model: ${model}\nAspect Ratio: ${aspect}\n\nPrompt:\n${prompt}`;
    promptOutput.textContent = finalOutput;
  });

  clearBtn?.addEventListener('click', () => {
    manualPrompt.value = '';
    negativePrompt.value = '';
    promptOutput.textContent = '';
    negativeHelper.textContent = '';
  });

  modelSelect?.addEventListener('change', e => {
    const selected = e.target.value;
    updateAspectOptions(selected);
  });

  // Dark mode toggle
  if (localStorage.getItem('pbxp.darkMode') === 'true') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.checked = true;
  }

  darkModeToggle?.addEventListener('change', e => {
    const isDark = e.target.checked;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('pbxp.darkMode', isDark);
  });

  await loadModelCapabilities();

  populateSelect(document.getElementById('imageType'), 'image-types.json');
  populateSelect(document.getElementById('subject'), 'subjects.json');
  populateSelect(document.getElementById('action'), 'actions.json');
  populateSelect(document.getElementById('environment'), 'environments.json');
  populateSelect(document.getElementById('descriptors'), 'descriptors.json');
  populateSelect(document.getElementById('quality'), 'quality-packs.json');
});
