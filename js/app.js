(() => {
  'use strict';

  const data = window.PORTFOLIO;
  if (!data) throw new Error('Portfolio data not found.');
  const visibleItems = data.items.filter((item) => item.kind !== 'Video' || item.video || item.embed);

  const state = {
    folder: 'all',
    selected: null,
    view: localStorage.getItem('portfolio:view') || 'grid',
    theme: localStorage.getItem('portfolio:theme') || 'dark'
  };

  const $ = (selector) => document.querySelector(selector);
  const els = {
    root: document.documentElement,
    folderTree: $('#folderTree'),
    mobileFolders: $('#mobileFolders'),
    profileBio: $('#profileBio'),
    highlights: $('#highlights'),
    gallery: $('#gallery'),
    collectionTitle: $('#collectionTitle'),
    collectionCount: $('#collectionCount'),
    breadcrumbs: $('#breadcrumbs'),
    inspectorContent: $('#inspectorContent'),
    titlebarPath: $('#titlebarPath'),
    statusPath: $('#statusPath'),
    statusSelection: $('#statusSelection'),
    themeButton: $('#themeButton'),
    searchButton: $('#searchButton'),
    viewer: $('#viewer'),
    viewerBackdrop: $('#viewerBackdrop'),
    viewerClose: $('#viewerClose'),
    viewerStage: $('#viewerStage'),
    viewerFile: $('#viewerFile'),
    viewerKind: $('#viewerKind'),
    viewerTitle: $('#viewerTitle'),
    viewerDescription: $('#viewerDescription'),
    commandPalette: $('#commandPalette'),
    paletteBackdrop: $('#paletteBackdrop'),
    searchInput: $('#searchInput'),
    paletteResults: $('#paletteResults')
  };

  const highlightFiles = ['cap-monitor.webp', 'stars-texture3.webp', 'console-ff.webp', 'wow.mp4'];
  const previewObservers = new Map();
  let returnFocus = null;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = localStorage.getItem('portfolio:motion') === 'paused' || motionPreference.matches;

  const icons = {
    folder: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l1.8 2H20.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V6.5Z"></path></svg>`,
    archive: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v13H4zM3 3.5h18v3H3zM9 11h6"></path></svg>`,
    star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.4 5.4 5.6.5-4.2 3.8 1.2 5.5-4.9-2.8-4.9 2.8 1.2-5.5L4 8.9l5.6-.5L12 3Z"></path></svg>`
  };

  function safe(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function folderById(id) {
    return data.folders.find((folder) => folder.id === id) || data.folders[0];
  }

  function itemsForFolder(id) {
    if (id === 'all') return visibleItems;
    if (id === 'highlights') return highlightFiles
      .map((file) => visibleItems.find((item) => item.file === file))
      .filter(Boolean);
    return visibleItems.filter((item) => item.folder === id);
  }

  function initials(item) {
    return item.kind === 'Video' ? '▶' : item.kind.slice(0, 2).toUpperCase();
  }

  function mediaThumb(item) {
    if (item.thumb) {
      return `<img src="${safe(item.thumb)}" alt="" loading="lazy" decoding="async" fetchpriority="low" />`;
    }
    return `<div class="preview-placeholder"><span class="placeholder-glyph">${safe(initials(item))}</span></div>`;
  }

  function videoElement(item, options = {}) {
    if (!item.video) {
      return `<div class="preview-placeholder is-unavailable"><span>No preview</span></div>`;
    }
    const controls = options.controls ? ' controls' : '';
    const autoplay = options.autoplay ? ' autoplay' : '';
    const loop = options.loop ? ' loop' : '';
    const muted = options.muted ? ' muted' : '';
    const preload = options.preload || 'metadata';
    const poster = item.thumb ? ` poster="${safe(item.thumb)}"` : '';
    return `
        <video class="preview-video"${controls}${autoplay}${loop}${muted} playsinline preload="${safe(preload)}"${poster}>
          <source src="${safe(item.video)}" type="${safe(videoType(item.video))}" />
        </video>`;
  }

  function cardMedia(item) {
    if (item.kind === 'Video') {
      if (!item.video) return `<div class="preview-placeholder is-unavailable"><span>No video file</span></div>`;
      return `
        <video class="preview-video" muted loop playsinline preload="none"${item.thumb ? ` poster="${safe(item.thumb)}"` : ''}>
          <source data-src="${safe(item.video)}" type="${safe(videoType(item.video))}" />
        </video>`;
    }
    return mediaThumb(item);
  }

  function videoType(src = '') {
    const ext = src.split('.').pop().toLowerCase();
    const types = {
      mp4: 'video/mp4',
      m4v: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
      avi: 'video/x-msvideo'
    };
    return types[ext] || '';
  }

  function renderFolderTree() {
    const folderButtons = data.folders.map((folder) => {
      const count = itemsForFolder(folder.id).length;
      return `
        <button class="folder-button ${folder.id === state.folder ? 'is-active' : ''}" ${folder.id === state.folder ? 'aria-current="page"' : ''} data-folder="${safe(folder.id)}" type="button">
          ${icons[folder.icon] || icons.folder}
          <span>${safe(folder.label)}</span>
          <span class="folder-count">${count}</span>
        </button>`;
    }).join('');
    els.folderTree.innerHTML = folderButtons;
    els.mobileFolders.innerHTML = folderButtons;

    document.querySelectorAll('#folderTree [data-folder], #mobileFolders [data-folder]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.folder));
    });
  }

  function renderProfile() {
    if (els.profileBio) els.profileBio.textContent = data.profile?.bio || '';
  }

  function renderHighlights() {
    if (!els.highlights) return;
    disposePreviews(els.highlights);
    if (state.folder !== 'all') {
      els.highlights.innerHTML = '';
      return;
    }
    const items = highlightFiles
      .map((file) => visibleItems.find((item) => item.file === file))
      .filter(Boolean);

    els.highlights.innerHTML = `
      <div class="section-label">Highlights <small>SELECTED / 04</small></div>
      <div class="highlight-grid">
        ${items.map((item) => `
          <button class="highlight-card" data-highlight="${safe(item.id)}" type="button">
            <span class="highlight-media">${cardMedia(item)}</span>
          <span class="highlight-copy">
            <strong>${safe(item.title)}</strong>
            <span>${safe(item.kind)} ↗</span>
            </span>
          </button>
        `).join('')}
      </div>
    `;

    els.highlights.querySelectorAll('[data-highlight]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = visibleItems.find((entry) => entry.id === button.dataset.highlight);
        if (!item) return;
        openViewer(item.id);
      });
    });
    hydrateVideoPreviews(els.highlights);
  }

  function renderHeading() {
    const folder = folderById(state.folder);
    const count = itemsForFolder(state.folder).length;
    els.collectionTitle.textContent = folder.id === 'all' ? 'All Work' : folder.label;
    els.collectionCount.textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'piece' : 'pieces'}`;
    $('#mainIntro').hidden = state.folder !== 'all';
    els.titlebarPath.textContent = folder.path;
    els.statusPath.textContent = folder.path;
    els.breadcrumbs.innerHTML = `
      <span>portfolio</span>
      ${folder.id === 'all' ? '' : `<span class="crumb-separator">/</span><span class="crumb-current">${safe(folder.label.toLowerCase())}</span>`}
    `;
  }

  function renderGallery() {
    const items = itemsForFolder(state.folder);
    disposePreviews(els.gallery);
    els.gallery.classList.toggle('is-list', state.view === 'list');
    els.gallery.innerHTML = items.map((item) => `
      <article class="file-card ${state.selected === item.id ? 'is-selected' : ''}" data-id="${safe(item.id)}" tabindex="0" role="button" aria-label="${safe(item.title)}" style="--preview-accent:${safe(item.accent || '')}">
        <div class="file-preview">
          ${cardMedia(item)}
          <span class="file-kind">${safe(item.kind)}</span>
        </div>
        <div class="file-meta">
          <div class="file-name"><strong>${safe(item.title)}</strong><span>${safe(item.year)}</span></div>
        </div>
      </article>
    `).join('');

    els.gallery.querySelectorAll('.file-card').forEach((card) => {
      const select = () => window.matchMedia('(max-width: 1040px)').matches ? openViewer(card.dataset.id) : selectItem(card.dataset.id);
      card.addEventListener('click', select);
      card.addEventListener('dblclick', () => openViewer(card.dataset.id));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') openViewer(card.dataset.id);
        if (event.key === ' ') { event.preventDefault(); select(); }
      });
    });
    hydrateVideoPreviews(els.gallery);
  }

  function hydrateVideoPreviews(root = document) {
    const videos = [...root.querySelectorAll('.preview-video:not([controls])')];
    if (!videos.length) return;

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        video.dataset.visible = String(entry.isIntersecting);
        updatePreview(video);
      });
    }, { root: null, threshold: 0.15 });

    videos.forEach((video) => observer.observe(video));
    previewObservers.set(root, observer);
  }

  function disposePreviews(root) {
    previewObservers.get(root)?.disconnect();
    previewObservers.delete(root);
    root.querySelectorAll('video').forEach((video) => {
      video.pause();
      video.querySelectorAll('source').forEach((source) => source.removeAttribute('src'));
      video.load();
    });
  }

  function updatePreview(video) {
    const blocked = motionPaused || document.hidden || navigator.connection?.saveData ||
      els.viewer.classList.contains('is-open') || els.commandPalette.classList.contains('is-open');
    if (blocked || video.dataset.visible !== 'true') { video.pause(); return; }
    const source = video.querySelector('source[data-src]');
    if (source && !source.hasAttribute('src')) {
      source.src = source.dataset.src;
      video.load();
    }
    video.play().catch(() => {});
  }

  function syncPreviews() {
    document.querySelectorAll('video.preview-video:not([controls])').forEach(updatePreview);
  }

  function renderInspector() {
    const item = visibleItems.find((entry) => entry.id === state.selected);
    els.statusSelection.textContent = item ? '1 selected' : '0 selected';

    if (!item) {
      els.inspectorContent.innerHTML = `
        <div class="empty-inspector">
          <div class="empty-cube" aria-hidden="true"></div>
          <p>Select an artwork.</p>
        </div>`;
      return;
    }

    els.inspectorContent.innerHTML = `
      <div class="inspector-hero" style="--preview-accent:${safe(item.accent || '')}">${item.kind === 'Video' ? videoElement(item, { controls: true, preload: 'metadata' }) : mediaThumb(item)}</div>
      <div class="inspector-block">
        <p class="eyebrow">${safe(item.kind)}</p>
        <h2 class="inspector-title">${safe(item.title)}</h2>
      </div>
      <div class="inspector-block"><p class="inspector-description">${safe(item.description)}</p></div>
      <div class="inspector-block">
        <dl class="meta-table">
          <dt>Year</dt><dd>${safe(item.year)}</dd>
          <dt>Medium</dt><dd>${safe(item.medium)}</dd>
          <dt>Tools</dt><dd>${safe((item.tools || []).join(', '))}</dd>
          <dt>Type</dt><dd>${safe(item.kind)}</dd>
        </dl>
      </div>
      <div class="inspector-block"><div class="tag-list">${(item.tags || []).map((tag) => `<span class="tag">#${safe(tag)}</span>`).join('')}</div></div>
      <div class="inspector-block"><button class="open-button" id="inspectorOpen" type="button">${item.kind === 'Video' ? 'OPEN VIDEO' : 'VIEW ARTWORK'} ↗</button></div>
    `;
    $('#inspectorOpen')?.addEventListener('click', () => openViewer(item.id));
  }

  function selectItem(id) {
    state.selected = id;
    els.gallery.querySelectorAll('.file-card').forEach((card) => card.classList.toggle('is-selected', card.dataset.id === id));
    renderInspector();
  }

  function navigate(folder, updateHash = true) {
    if (!data.folders.some((entry) => entry.id === folder)) folder = 'all';
    state.folder = folder;
    state.selected = (folder === 'all' ? itemsForFolder('highlights') : itemsForFolder(folder))[0]?.id || null;
    if (updateHash) history.pushState(null, '', `#/${folder}`);
    renderFolderTree();
    renderHeading();
    renderHighlights();
    renderGallery();
    renderInspector();
    window.scrollTo({ top: 0, behavior: 'instant' });
    syncMatrix();
  }

  function viewerMedia(item) {
    if (item.kind === 'Video') {
      if (item.embed) {
        return `<iframe src="${safe(item.embed)}" title="${safe(item.title)}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      }
      if (item.video) {
        return videoElement(item, { controls: true, preload: 'metadata' });
      }
    }
    if (item.src) {
      return `<img src="${safe(item.src)}" alt="${safe(item.title)}" decoding="async" />`;
    }
    return `<div class="viewer-placeholder" style="--preview-accent:${safe(item.accent || '')}"><span>${safe(initials(item))}</span></div>`;
  }

  function openViewer(id) {
    const item = visibleItems.find((entry) => entry.id === id);
    if (!item) return;
    returnFocus = document.activeElement;
    selectItem(id);
    els.inspectorContent.querySelectorAll('video').forEach((video) => video.pause());
    els.viewerFile.textContent = item.title;
    els.viewerKind.textContent = item.kind;
    els.viewerTitle.textContent = item.title;
    els.viewerDescription.textContent = item.description;
    els.viewerStage.innerHTML = viewerMedia(item);
    els.viewer.classList.add('is-open');
    els.viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.app-shell').inert = true;
    syncPreviews();
    els.viewerClose.focus();
  }

  function closeViewer() {
    els.viewer.classList.remove('is-open');
    els.viewer.setAttribute('aria-hidden', 'true');
    els.viewerStage.innerHTML = '';
    document.body.style.overflow = '';
    $('.app-shell').inert = false;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    syncPreviews();
  }

  function setTheme(theme) {
    state.theme = theme === 'light' ? 'light' : 'dark';
    els.root.dataset.theme = state.theme;
    localStorage.setItem('portfolio:theme', state.theme);
  }

  function searchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) return visibleItems;
    return visibleItems.filter((item) => [
      item.title,
      item.file,
      item.kind,
      item.medium,
      item.year,
      ...(item.tools || []),
      ...(item.tags || [])
    ].join(' ').toLowerCase().includes(q));
  }

  function renderSearch(query = '') {
    const results = searchResults(query);
    const folders = data.folders.filter((folder) => !query.trim() || folder.label.toLowerCase().includes(query.trim().toLowerCase()));
    if (!results.length && !folders.length) {
      els.paletteResults.innerHTML = `<div class="palette-empty">No files match “${safe(query)}”.</div>`;
      return;
    }
    els.paletteResults.innerHTML = folders.map((folder) => `
      <button class="palette-result" data-command="${safe(folder.id)}" type="button"><span class="result-thumb" aria-hidden="true">&gt;_</span><span class="result-main"><strong>${safe(folder.label)}</strong><span>cd /${safe(folder.id)}</span></span><span class="result-kind">Collection</span></button>
    `).join('') + results.map((item) => `
      <button class="palette-result" data-result="${safe(item.id)}" type="button">
        <span class="result-thumb" style="--preview-accent:${safe(item.accent || '')}">${mediaThumb(item)}</span>
        <span class="result-main"><strong>${safe(item.title)}</strong><span>${safe(item.kind)} · ${safe(item.year)}</span></span>
        <span class="result-kind">${safe(item.kind)}</span>
      </button>
    `).join('');
    els.paletteResults.querySelector('.palette-result')?.classList.add('is-active');
    els.paletteResults.querySelectorAll('[data-command]').forEach((button) => {
      button.addEventListener('click', () => { closeSearch(); navigate(button.dataset.command); });
    });
    els.paletteResults.querySelectorAll('[data-result]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = visibleItems.find((entry) => entry.id === button.dataset.result);
        if (!item) return;
        closeSearch();
        navigate(item.folder);
        openViewer(item.id);
      });
    });
  }

  function openSearch() {
    returnFocus = document.activeElement;
    renderSearch('');
    els.commandPalette.classList.add('is-open');
    els.commandPalette.setAttribute('aria-hidden', 'false');
    $('.app-shell').inert = true;
    document.body.style.overflow = 'hidden';
    syncPreviews();
    requestAnimationFrame(() => els.searchInput.focus());
  }

  function closeSearch() {
    els.commandPalette.classList.remove('is-open');
    els.commandPalette.setAttribute('aria-hidden', 'true');
    els.searchInput.value = '';
    $('.app-shell').inert = false;
    document.body.style.overflow = '';
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    syncPreviews();
  }

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === state.view);
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      localStorage.setItem('portfolio:view', state.view);
      document.querySelectorAll('[data-view]').forEach((entry) => entry.classList.toggle('is-active', entry === button));
      renderGallery();
    });
  });

  els.themeButton.addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
  els.searchButton.addEventListener('click', openSearch);
  els.viewerClose.addEventListener('click', closeViewer);
  els.viewerBackdrop.addEventListener('click', closeViewer);
  els.paletteBackdrop.addEventListener('click', closeSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  els.searchInput.addEventListener('input', () => renderSearch(els.searchInput.value));
  $('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    els.gallery.focus();
    els.gallery.scrollIntoView({ block: 'start' });
  });

  window.addEventListener('keydown', (event) => {
    const paletteOpen = els.commandPalette.classList.contains('is-open');
    const dialog = paletteOpen ? els.commandPalette : els.viewer.classList.contains('is-open') ? els.viewer : null;
    if (dialog && event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not([tabindex="-1"]), input, video[controls], iframe')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (paletteOpen && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) && event.target === els.searchInput) {
      event.preventDefault();
      const results = [...els.paletteResults.querySelectorAll('.palette-result')];
      let index = results.findIndex((result) => result.classList.contains('is-active'));
      if (event.key === 'Enter') { results[index]?.click(); return; }
      if (!results.length) return;
      index = (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      results.forEach((result, i) => result.classList.toggle('is-active', i === index));
      results[index].scrollIntoView({ block: 'nearest' });
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (paletteOpen) { closeSearch(); return; }
      if (els.viewer.classList.contains('is-open')) closeViewer();
      openSearch();
      return;
    }
    if (event.key === 'Escape') {
      if (els.commandPalette.classList.contains('is-open')) closeSearch();
      else if (els.viewer.classList.contains('is-open')) closeViewer();
    }
  });

  window.addEventListener('hashchange', () => {
    const folder = location.hash.replace(/^#\//, '') || 'all';
    navigate(folder, false);
  });

  const canvas = $('#matrixRain');
  const context = canvas.getContext('2d');
  let rainFrame = 0, rainVisible = false, lastRainTime = 0;
  let drops = [];
  const glyphs = '01VOLT<>/[]{}:;=+*';

  function sizeMatrix() {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    context?.setTransform(scale, 0, 0, scale, 0, 0);
    drops = Array.from({ length: Math.ceil(rect.width / 18) }, () => Math.random() * rect.height / 18);
    paintMatrix(true);
  }

  function paintMatrix(clear = false) {
    if (!context || !canvas.width) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (clear) context.clearRect(0, 0, width, height);
    const light = state.theme === 'light';
    context.fillStyle = light ? 'rgba(240,243,244,0.18)' : 'rgba(9,11,16,0.18)';
    context.fillRect(0, 0, width, height);
    context.font = '12px Consolas, monospace';
    drops.forEach((drop, column) => {
      context.fillStyle = column % 4 === 0 ? '#a270ff' : light ? '#007763' : '#58efd0';
      context.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], column * 18, drop * 18);
      drops[column] = drop * 18 > height && Math.random() > .97 ? 0 : drop + .6;
    });
  }

  function tickMatrix(time) {
    if (time - lastRainTime > 80) { paintMatrix(); lastRainTime = time; }
    rainFrame = requestAnimationFrame(tickMatrix);
  }

  function syncMatrix() {
    cancelAnimationFrame(rainFrame);
    if (!motionPaused && !document.hidden && rainVisible && state.folder === 'all' && context) rainFrame = requestAnimationFrame(tickMatrix);
  }

  function setMotion(paused) {
    motionPaused = paused;
    els.root.dataset.motion = paused ? 'paused' : 'running';
    localStorage.setItem('portfolio:motion', paused ? 'paused' : 'running');
    const button = $('#motionButton');
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume visual effects' : 'Pause visual effects');
    button.title = button.getAttribute('aria-label');
    button.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    syncMatrix();
    syncPreviews();
  }

  $('#motionButton').addEventListener('click', () => setMotion(!motionPaused));
  motionPreference.addEventListener('change', (event) => setMotion(event.matches));
  document.addEventListener('visibilitychange', () => { syncMatrix(); syncPreviews(); });
  if ('ResizeObserver' in window) new ResizeObserver(sizeMatrix).observe(canvas);
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
    rainVisible = entry.isIntersecting;
    syncMatrix();
  }).observe(canvas);
  setTheme(state.theme);
  setMotion(motionPaused);
  renderProfile();
  const initialFolder = location.hash.replace(/^#\//, '') || 'all';
  navigate(initialFolder, false);
})();
