/*
  PromptBuilder.Xp - Utilities
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
*/
async function generatePrompt() {
  const platformId = document.getElementById('platform').value;
  const model = document.getElementById('model').value;
  const style = document.getElementById('style').value;
  const aspect = document.getElementById('aspect').value;
  const promptType = document.getElementById('promptType').value;
  const qualityPack = Array.from(document.getElementById('qualityPackOptions').selectedOptions).map(opt => opt.value);
  const preserveCase = document.getElementById('preserveCase').checked;
  const safeMode = document.getElementById('safeMode').checked;
  const weights = document.getElementById('weights').checked;

  if (!platformId || !model) {
    document.getElementById('output').innerText = 'Error: Please select a platform and model.';
    return;
  }

  const bubbles = document.querySelectorAll('#promptBuilder .bubble');
  let prompt = '';
  bubbles.forEach(bubble => {
    const typeSelect = bubble.querySelector('select');
    const valueSelect = bubble.querySelectorAll('select')[1];
    if (typeSelect.value && valueSelect.value) {
      prompt += `${valueSelect.value}, `;
    }
  });
  prompt = prompt.slice(0, -2);
  if (!prompt) {
    document.getElementById('output').innerText = 'Error: Please add at least one prompt bubble.';
    return;
  }
  if (qualityPack.length > 0) prompt += ', ' + qualityPack.join(', ');
  if (weights && !isAdvancedPrompt(prompt)) prompt = applyWeights(prompt);
  if (!preserveCase) prompt = prompt.toLowerCase();

  const flaggedWords = await fetch('data/flagged-words.json').then(res => res.json());
  const normalizedPrompt = normalizePrompt(prompt);
  const detected = flaggedWords.filter(word => normalizedPrompt.includes(word));

  const output = document.getElementById('output');
  if (safeMode && detected.length > 0) {
    output.innerHTML = `Prompt hidden due to flagged terms: ${detected.join(', ')}. Try using terms like 'adult character' or 'mature figure'.`;
    return;
  }

  let result = `Platform: ${platformId}\nModel: ${model}\nStyle: ${style || 'N/A'}\nAspect Ratio: ${aspect || 'N/A'}\nPrompt Type: ${promptType}\n\nPrompt:\n${prompt}`;
  const negative = getNegativePrompt();
  if (modelSupportsNegative(platformId, model) && negative) result += `\n\nNegative Prompt:\n${negative}`;
  output.innerText = result;
}

async function randomizePrompt(container, bubbleTypes) {
  const promptType = document.getElementById('promptType').value;
  const videoOptions = await fetch('data/video-options.json').then(res => res.json());
  const bubbles = container.querySelectorAll('.bubble');
  bubbles.forEach(bubble => {
    if (!bubble.querySelector('.lock-btn').classList.contains('locked')) {
      const typeSelect = bubble.querySelector('select');
      const valueSelect = bubble.querySelectorAll('select')[1];
      const type = typeSelect.value;
      if (type) {
        const options = promptType === 'video' && type === 'camera' ? videoOptions.camera : bubbleTypes[type] || [];
        const randomOption = options[Math.floor(Math.random() * options.length)];
        valueSelect.value = randomOption?.value || '';
      }
    }
  });
}

async function modelSupportsNegative(platformId, model) {
  const platforms = await fetch('data/platforms.json').then(res => res.json());
  const platform = platforms.find(p => p.id === platformId);
  if (!platform) return false;
  const modelData = platform.models.find(m => m.value === model);
  return modelData?.supportsNegative || false;
}

function getNegativePrompt() {
  const selected = Array.from(document.getElementById('negativePackOptions').selectedOptions).map(opt => opt.value);
  const manual = document.getElementById('negativePrompt').value.trim();
  return [...selected, manual].filter(Boolean).join(', ');
}

async function checkModel() {
  const platformId = document.getElementById('platform').value;
  const model = document.getElementById('model').value;
  const negativePrompt = document.getElementById('negativePrompt');
  const helper = document.getElementById('negativeHelper');
  const negativePack = document.getElementById('negativePackOptions');

  if (await modelSupportsNegative(platformId, model)) {
    negativePrompt.disabled = false;
    negativePack.disabled = false;
    helper.innerText = 'Optional: things to avoid...';
  } else {
    negativePrompt.disabled = true;
    negativePack.disabled = true;
    helper.innerText = 'This model does not support negative prompts.';
    negativePrompt.value = '';
  }
}

// Weighting, normalization, copyPrompt, and toggleDarkMode unchanged
function normalizePrompt(prompt) {
  return prompt
    .toLowerCase()
    .replace(/\([^)]+\)/g, match => match.toLowerCase())
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
}

function applyWeights(text) {
  const keyTerms = [
    "warrior", "landscape", "serene", "dramatic", "soft lighting", "vibrant", "mythical", "futuristic",
    "sky", "girl", "car", "tree", "castle", "dragon", "samurai", "face", "eyes", "background",
    "ethereal", "glow", "moonlit", "mystical", "enchanted", "radiant", "starlit", "volcanic",
    "crystalline", "marble", "runes", "weathered", "iridescent", "silk", "frozen", "thorn",
    "arcane", "sigils", "floating", "ghostly", "sacred", "shimmering", "portal", "flora",
    "mushrooms", "forest", "crystals", "waterfalls", "fog", "gardens", "brambles", "ruins",
    "fiery", "tattoos", "cloak", "armor", "gauntlets", "antlers", "robes", "wings", "limbs",
    "horrors", "wolves", "golems", "serpents", "dragons", "spirits", "griffons", "beasts",
    "blade", "dagger", "staff", "sword", "bow", "spear", "grimoire", "crown", "shield",
    "citadel", "caves", "spire", "cathedral", "palace", "library", "tomb", "shrine",
    "bioluminescent", "ancient", "eldritch", "ocean", "flowing", "phoenix", "chaos", "gilded", "halls",
    "moss", "sigil"
  ];
  return text.replace(new RegExp(`\\b(${keyTerms.join("|")})\\b`, "gi"), match => `(${match})`);
}

function isAdvancedPrompt(text) {
  const advancedKeywords = ["neural", "fractal", "32K", "bioluminescent", "cinematic", "style transfer"];
  return text.length > 300 || advancedKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function copyPrompt() {
  const output = document.getElementById('output');
  if (!navigator.clipboard) {
    alert('Clipboard API not supported. Please copy manually.');
    return;
  }
  navigator.clipboard.writeText(output.innerText).then(() => {
    alert('Prompt copied to clipboard!');
  }).catch(err => {
    alert('Failed to copy. Try manually: Ctrl+C');
    console.error('Clipboard error:', err);
  });
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}