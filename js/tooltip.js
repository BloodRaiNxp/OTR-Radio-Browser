/*
  PromptBuilder.Xp - Tooltip Logic
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
*/
function showHelp(fieldId) {
  const helpText = {
    platform: 'Select the AI platform you are using to generate art or video.',
    model: 'Choose a model provided by the selected platform.',
    style: 'Choose a visual style to shape the artistic tone of your prompt.',
    aspect: 'Pick an aspect ratio to define the image or video proportions.',
    promptType: 'Select whether to generate an image or video prompt.',
    promptBuilder: 'Build your prompt using editable bubbles for modular control.',
    qualityPackOptions: 'Select modifiers to enhance your prompt with lighting, textures, or effects.',
    weights: 'Emphasize key terms by wrapping them in parentheses for AI prioritization.',
    preserveCase: 'Keep the original capitalization of your input text.',
    safeMode: 'Block prompts with sensitive or banned terms for safer content.',
    negativePackOptions: 'Select terms to exclude from the generated image or video.',
    negativePrompt: 'Add custom terms to avoid in the output.'
  };

  const tooltip = document.createElement('div');
  tooltip.className = 'help-tooltip';
  tooltip.innerText = helpText[fieldId] || 'Click for help.';
  document.body.appendChild(tooltip);

  const helpIcon = document.querySelector(`[data-help="${fieldId}"]`);
  const rect = helpIcon.getBoundingClientRect();
  const tooltipWidth = 200;
  let leftPos = rect.left + window.scrollX - (tooltipWidth / 2) + (rect.width / 2);
  let topPos = rect.bottom + window.scrollY + 5;

  if (leftPos + tooltipWidth > window.innerWidth) {
    leftPos = window.innerWidth - tooltipWidth - 10;
  } else if (leftPos < 0) {
    leftPos = 10;
  }

  if (topPos + 100 > window.innerHeight + window.scrollY) {
    topPos = rect.top + window.scrollY - 105;
  }

  tooltip.style.top = topPos + 'px';
  tooltip.style.left = leftPos + 'px';
  tooltip.style.display = 'block';

  setTimeout(() => {
    tooltip.onclick = () => tooltip.style.display = 'none';
    document.addEventListener('click', function hide(e) {
      if (!tooltip.contains(e.target) && !helpIcon.contains(e.target)) {
        tooltip.style.display = 'none';
        document.removeEventListener('click', hide);
      }
    });
  }, 0);
}
