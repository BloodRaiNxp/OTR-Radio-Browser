/*
  PromptBuilder.Xp - Tooltip Logic
  Copyright (c) 2025 BloodRaiNxp
  Version: 1.0.0
  Created: September 23, 2025
*/
document.addEventListener('DOMContentLoaded', () => {
  const tooltips = document.querySelectorAll('.tooltip');
  tooltips.forEach(tooltip => {
    tooltip.addEventListener('click', (e) => {
      e.preventDefault();
      const tooltipText = tooltip.getAttribute('data-tooltip');
      const existingTooltip = document.querySelector('.tooltip-box');
      if (existingTooltip) existingTooltip.remove();
      const tooltipBox = document.createElement('div');
      tooltipBox.className = 'tooltip-box';
      tooltipBox.textContent = tooltipText;
      tooltipBox.style.position = 'absolute';
      tooltipBox.style.background = '#333';
      tooltipBox.style.color = '#fff';
      tooltipBox.style.padding = '5px 10px';
      tooltipBox.style.borderRadius = '4px';
      tooltipBox.style.zIndex = '1000';
      // Position near the ? icon
      const rect = tooltip.getBoundingClientRect();
      tooltipBox.style.top = `${rect.bottom + window.scrollY + 5}px`;
      tooltipBox.style.left = `${rect.left + window.scrollX}px`;
      document.body.appendChild(tooltipBox);
      setTimeout(() => tooltipBox.remove(), 3000);
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tooltip')) {
      const existingTooltip = document.querySelector('.tooltip-box');
      if (existingTooltip) existingTooltip.remove();
    }
  });
});
