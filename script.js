function toggleAnswer(btn) {
  const ans = btn.nextElementSibling;
  const visible = ans.classList.toggle('visible');
  btn.textContent = visible ? 'Hide Answer' : 'Show Answer';
}

document.addEventListener('DOMContentLoaded', () => {
  const hasConfig = typeof VISIBLE_KEYS !== 'undefined';
  const allowed = new Set(hasConfig ? VISIBLE_KEYS : []);
  let n = 1;
  document.querySelectorAll('.question').forEach(q => {
    const key = q.dataset.key;
    if (hasConfig && (!key || !allowed.has(key))) {
      q.style.display = 'none';
      return;
    }
    const label = q.querySelector('.question-number');
    if (label) label.textContent = 'Question ' + n;
    n += 1;
  });
});
