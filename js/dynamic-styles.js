// js/dynamic-styles.js
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .suggest-btn { display: none; }
    .suggestions-btn { display: none; }
  `;
  document.head.appendChild(style);
});
