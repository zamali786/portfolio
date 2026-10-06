(() => {
  'use strict';
  const cases = [...document.querySelectorAll('[data-case-tags]')];
  const links = [...document.querySelectorAll('[data-index-tags]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const status = document.getElementById('filter-status');
  const description = document.getElementById('filter-description');
  const intro = document.querySelector('.work-intro');
  const index = document.getElementById('case-index');
  const archive = document.querySelector('.archive-wrap');
  const experience = document.getElementById('ledger');
  const originalTitle = document.title;
  let current = 'featured';
  function matches(tags, filter) { return filter === 'all' || tags.split(' ').includes(filter); }
  function filterCases(filter) {
    current = filter;
    cases.forEach(el => { el.hidden = true; });
    links.forEach(el => { el.hidden = !matches(el.dataset.indexTags, filter); });
    filters.forEach(el => el.setAttribute('aria-pressed', String(el.dataset.filter === filter)));
    const total = links.filter(el => !el.hidden).length;
    const selected = filters.find(el => el.dataset.filter === filter);
    const label = selected?.textContent || 'All work';
    if (description) {
      description.textContent = selected?.dataset.description || '';
      description.hidden = !description.textContent;
    }
    if (status) status.textContent = `${label} · ${total} case ${total === 1 ? 'study' : 'studies'}`;
  }
  function showLibrary() {
    filterCases(current);
    [intro, index, archive, experience].forEach(el => { if (el) el.hidden = false; });
    document.body.classList.remove('reading-case');
    document.title = originalTitle;
    cases.forEach(el => el.querySelector('h2')?.removeAttribute('aria-level'));
  }
  function followHash(scroll = true) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    // Keep links shared from the previous portfolio useful.
    const aliases = { studies: 'case-index', filter: 'case-index', stack: 'ledger', principles: 'ledger' };
    if (id.startsWith('browse-')) {
      const filter = id.slice(7);
      if (filters.some(button => button.dataset.filter === filter)) current = filter;
      showLibrary();
      if (scroll) requestAnimationFrame(() => index?.scrollIntoView({ behavior: 'instant', block: 'start' }));
      return;
    }
    const target = document.getElementById(aliases[id] || id);
    if (!target) { showLibrary(); return; }
    const section = target.closest('[data-case-tags]');
    if (section) {
      cases.forEach(el => { el.hidden = el !== section; });
      [intro, index, archive, experience].forEach(el => { if (el) el.hidden = true; });
      document.body.classList.add('reading-case');
      const heading = section.querySelector('h2');
      heading?.setAttribute('aria-level', '1');
      document.title = `${heading?.textContent} — Zameer Ali`;
      if (scroll) heading?.focus({ preventScroll: true });
    } else {
      showLibrary();
      if (scroll && target === index) index.focus({ preventScroll: true });
    }
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }
  document.querySelector('.filter-list')?.removeAttribute('hidden');
  filters.forEach(button => button.addEventListener('click', () => {
    current = button.dataset.filter;
    showLibrary();
    // Shareable capability views; opening a case then uses normal browser history.
    window.history.replaceState(null, '', `#browse-${current}`);
  }));
  if (cases.length) followHash();
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

  const viewer = document.getElementById('artifact-viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    const viewport = viewer.querySelector('.artifact-viewer-scroll');
    const fullImage = document.createElement('img');
    viewport.append(fullImage);
    const zoom = document.getElementById('artifact-zoom');
    let previousOverflow = '';
    document.querySelectorAll('.source-artifact').forEach(figure => {
      const open = figure.querySelector('.artifact-open');
      open.hidden = false;
      open.addEventListener('click', () => {
        const source = figure.querySelector('img');
        fullImage.src = source.src;
        fullImage.alt = source.alt;
        document.getElementById('artifact-viewer-title').textContent = figure.dataset.artifactTitle;
        document.getElementById('artifact-viewer-caption').textContent = figure.querySelector('figcaption > span').textContent;
        viewer.classList.remove('is-zoomed');
        zoom.setAttribute('aria-pressed', 'false');
        zoom.textContent = 'Actual size';
        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        viewer.showModal();
        viewport.scrollTop = viewport.scrollLeft = 0;
      });
    });
    zoom.addEventListener('click', () => {
      const enlarged = viewer.classList.toggle('is-zoomed');
      zoom.setAttribute('aria-pressed', String(enlarged));
      zoom.textContent = enlarged ? 'Fit to width' : 'Actual size';
    });
    document.getElementById('artifact-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => {
      document.documentElement.style.overflow = previousOverflow;
      fullImage.removeAttribute('src');
    });
  }
})();
