(() => {
  const opener = document.getElementById('open-help');
  const dialog = document.getElementById('help-dialog');
  const content = document.getElementById('help-content');
  const pages = [...dialog.querySelectorAll('[data-help-page]')];
  const previous = document.getElementById('help-previous');
  const next = document.getElementById('help-next');
  const counter = document.getElementById('help-page-number');
  let current = 0;

  function showPage(index) {
    current = Math.max(0, Math.min(pages.length - 1, index));
    pages.forEach((page, i) => { page.hidden = i !== current; });
    previous.disabled = current === 0;
    next.textContent = current === pages.length - 1 ? '閉じる' : '次へ →';
    counter.textContent = `${current + 1} / ${pages.length}`;
    content.scrollTop = 0;
  }
  opener.addEventListener('click', () => {
    showPage(0);
    if (!dialog.open) dialog.showModal();
  });
  previous.addEventListener('click', () => showPage(current - 1));
  next.addEventListener('click', () => {
    if (current === pages.length - 1) dialog.close();
    else showPage(current + 1);
  });
  document.getElementById('close-help').addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
  dialog.addEventListener('close', () => opener.focus());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPage(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPage(current + 1); }
  });
  showPage(0);
})();
