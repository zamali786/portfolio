(() => {
  'use strict';
  const cases = [...document.querySelectorAll('[data-case-tags]')];
  const links = [...document.querySelectorAll('[data-index-tags]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const status = document.getElementById('filter-status');
  let current = 'featured';
  function matches(tags, filter) { return filter === 'all' || tags.split(' ').includes(filter); }
  function filterCases(filter) {
    current = filter;
    cases.forEach(el => { el.hidden = !matches(el.dataset.caseTags, filter); });
    links.forEach(el => { el.hidden = !matches(el.dataset.indexTags, filter); });
    filters.forEach(el => el.setAttribute('aria-pressed', String(el.dataset.filter === filter)));
    const total = cases.filter(el => !el.hidden).length;
    const label = filters.find(el => el.dataset.filter === filter)?.textContent || 'All cases';
    if (status) status.textContent = `${label} · ${total} case ${total === 1 ? 'study' : 'studies'}`;
  }
  function followHash(scroll = true) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    // Keep links shared from the previous portfolio useful.
    const aliases = { studies: 'case-index', filter: 'case-index', stack: 'ledger', principles: 'ledger' };
    const target = document.getElementById(aliases[id] || id);
    if (!target) return;
    const section = target.closest('[data-case-tags]');
    if (section?.hidden) filterCases('all');
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }
  document.querySelector('.filter-list')?.removeAttribute('hidden');
  filters.forEach(button => button.addEventListener('click', () => filterCases(button.dataset.filter)));
  if (cases.length) { filterCases(current); followHash(); }
  window.addEventListener('hashchange', () => followHash());
  // Fonts can change layout after a password has replaced the document.
  let userMoved = false;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.addEventListener(type, () => { userMoved = true; }, { once: true, passive: true }));
  document.fonts?.ready.then(() => { if (!userMoved) followHash(); });

  document.querySelectorAll('.uiab').forEach(box => {
    const buttons = [...box.querySelectorAll('.uiab-toggle button')];
    const panes = [...box.querySelectorAll('.uiab-pane')];
    function select(button) {
      buttons.forEach(b => { const active = b === button; b.classList.toggle('on', active); b.setAttribute('aria-pressed', String(active)); });
      panes.forEach(p => { p.hidden = p.dataset.pane !== button.dataset.v; });
    }
    buttons.forEach((button, i) => {
      button.type = 'button';
      const pane = panes.find(p => p.dataset.pane === button.dataset.v);
      if (pane) { pane.id ||= `${box.id}-pane-${i}`; button.setAttribute('aria-controls', pane.id); }
      button.addEventListener('click', () => select(button));
    });
    // Lead with the useful design, while retaining the earlier direction for comparison.
    if (buttons.length) select(buttons.find(b => b.dataset.v === 'after') || buttons[0]);
  });
  document.querySelectorAll('.fixbtn[data-target]').forEach(button => {
    const exhibit = document.getElementById(button.dataset.target);
    if (!exhibit) return;
    button.hidden = false;
    button.type = 'button';
    button.setAttribute('aria-controls', button.dataset.target);
    let expanded = true;
    function render() {
      exhibit.querySelectorAll('.aftercell').forEach(cell => { cell.hidden = !expanded; });
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Hide revised copy' : 'Show revised copy';
    }
    button.addEventListener('click', () => { expanded = !expanded; render(); });
    render();
  });
  const demo = document.getElementById('fixdemo');
  const annotation = document.getElementById('annot');
  document.querySelectorAll('#fixdemo mark').forEach(mark => {
    const activate = () => { annotation.innerHTML = mark.dataset.note; mark.classList.add('seen'); };
    mark.addEventListener('click', activate);
    mark.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
  function rewrite(value) {
    demo?.classList.toggle('rewritten', value);
    const next = document.getElementById(value ? 'unrewriteBtn' : 'rewriteBtn');
    next?.focus({ preventScroll: true });
  }
  document.getElementById('rewriteBtn')?.addEventListener('click', () => rewrite(true));
  document.getElementById('unrewriteBtn')?.addEventListener('click', () => rewrite(false));
})();
