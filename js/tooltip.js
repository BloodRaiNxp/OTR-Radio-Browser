let activeTooltip = null;

document.addEventListener('DOMContentLoaded', () => {
  const tooltips = document.querySelectorAll('.tooltip');

  tooltips.forEach(tooltip => {
    tooltip.addEventListener('click', () => {
      const message = tooltip.getAttribute('data-tooltip');
      showTooltip(tooltip, message);
    });
  });
});

function showTooltip(element, message) {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }

  const tooltipBox = document.createElement('div');
  tooltipBox.className = 'tooltip-box';
  tooltipBox.textContent = message;

  const rect = element.getBoundingClientRect();
  tooltipBox.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltipBox.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltipBox);
  activeTooltip = tooltipBox;

  setTimeout(() => {
    if (tooltipBox === activeTooltip) {
      tooltipBox.remove();
      activeTooltip = null;
    }
  }, 3000);
}
