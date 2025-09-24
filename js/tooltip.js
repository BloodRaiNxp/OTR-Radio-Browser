function positionTooltip(el, tooltipBox) {
  const rect = el.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 8;
  let left = rect.left + window.scrollX;

  const maxRight = window.scrollX + document.documentElement.clientWidth - tooltipBox.offsetWidth - 8;
  if (left > maxRight) left = maxRight;

  tooltipBox.style.top = `${top}px`;
  tooltipBox.style.left = `${Math.max(8, left)}px`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('pointerenter', () => {
      const t = document.createElement('div');
      t.className = 'tooltip-box';
      t.textContent = el.dataset.tooltip;
      document.body.appendChild(t);
      positionTooltip(el, t);
      el._tooltip = t;
    });

    el.addEventListener('pointerleave', () => {
      if (el._tooltip) el._tooltip.remove();
      el._tooltip = null;
    });
  });
});
