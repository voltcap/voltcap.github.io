(() => {
  'use strict';

  const data = window.PORTFOLIO;
  if (!data) throw new Error('Portfolio data not found.');

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

  const icons = {
    folder: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l1.8 2H20.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V6.5Z"></path></svg>`,
    archive: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v13H4zM3 3.5h18v3H3zM9 11h6"></path></svg>`
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
    return id === 'all' ? data.items : data.items.filter((item) => item.folder === id);
  }

  function initials(item) {
    return item.kind === 'Video' ? '▶' : item.kind.slice(0, 2).toUpperCase();
  }

  function mediaThumb(item) {
    if (item.thumb) {
      return `<img src="${safe(item.thumb)}" alt="" loading="lazy" decoding="async" />`;
    }
    return `<div class="preview-placeholder"><span class="placeholder-glyph">${safe(initials(item))}</span></div>`;
  }

  function renderFolderTree() {
    els.folderTree.innerHTML = data.folders.map((folder) => {
      const count = itemsForFolder(folder.id).length;
      return `
        <button class="folder-button ${folder.id === state.folder ? 'is-active' : ''}" data-folder="${safe(folder.id)}" type="button">
          ${icons[folder.icon] || icons.folder}
          <span>${safe(folder.label)}</span>
          <span class="folder-count">${count}</span>
        </button>`;
    }).join('');

    els.folderTree.querySelectorAll('[data-folder]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.folder));
    });
  }

  function renderHeading() {
    const folder = folderById(state.folder);
    const count = itemsForFolder(state.folder).length;
    els.collectionTitle.textContent = folder.id === 'all' ? 'All work' : folder.label;
    els.collectionCount.textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'file' : 'files'}`;
    els.titlebarPath.textContent = folder.path;
    els.statusPath.textContent = folder.path;
    els.breadcrumbs.innerHTML = `
      <span>portfolio</span>
      ${folder.id === 'all' ? '' : `<span class="crumb-separator">/</span><span class="crumb-current">${safe(folder.label.toLowerCase())}</span>`}
    `;
  }

  function renderGallery() {
    const items = itemsForFolder(state.folder);
    els.gallery.classList.toggle('is-list', state.view === 'list');
    els.gallery.innerHTML = items.map((item) => `
      <article class="file-card ${state.selected === item.id ? 'is-selected' : ''}" data-id="${safe(item.id)}" tabindex="0" style="--preview-accent:${safe(item.accent || '')}">
        <div class="file-preview">
          ${mediaThumb(item)}
          <span class="file-kind">${safe(item.kind)}</span>
          ${item.kind === 'Video' ? '<span class="play-glyph" aria-hidden="true"></span>' : ''}
        </div>
        <div class="file-meta">
          <div class="file-name"><strong>${safe(item.file)}</strong><span>${safe(item.year)}</span></div>
          <p class="file-title">${safe(item.title)}</p>
        </div>
      </article>
    `).join('');

    els.gallery.querySelectorAll('.file-card').forEach((card) => {
      const select = () => selectItem(card.dataset.id);
      card.addEventListener('click', select);
      card.addEventListener('dblclick', () => openViewer(card.dataset.id));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') openViewer(card.dataset.id);
        if (event.key === ' ') { event.preventDefault(); select(); }
      });
    });
  }

  function renderInspector() {
    const item = data.items.find((entry) => entry.id === state.selected);
    els.statusSelection.textContent = item ? '1 selected' : '0 selected';

    if (!item) {
      els.inspectorContent.innerHTML = `
        <div class="empty-inspector">
          <div class="empty-cube" aria-hidden="true"></div>
          <p>Select a file to inspect its metadata.</p>
        </div>`;
      return;
    }

    const folder = folderById(item.folder);
    els.inspectorContent.innerHTML = `
      <div class="inspector-hero" style="--preview-accent:${safe(item.accent || '')}">${mediaThumb(item)}</div>
      <div class="inspector-block">
        <p class="eyebrow">${safe(item.kind)}</p>
        <h2 class="inspector-title">${safe(item.title)}</h2>
        <div class="inspector-file">${safe(folder.path.replace('~/', ''))}/${safe(item.file)}</div>
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
      <div class="inspector-block"><button class="open-button" id="inspectorOpen" type="button">OPEN FILE ↗</button></div>
    `;
    $('#inspectorOpen')?.addEventListener('click', () => openViewer(item.id));
  }

  function selectItem(id) {
    state.selected = id;
    renderGallery();
    renderInspector();
  }

  function navigate(folder, updateHash = true) {
    if (!data.folders.some((entry) => entry.id === folder)) folder = 'all';
    state.folder = folder;
    state.selected = null;
    if (updateHash) history.replaceState(null, '', `#/${folder}`);
    renderFolderTree();
    renderHeading();
    renderGallery();
    renderInspector();
  }

  function viewerMedia(item) {
    if (item.kind === 'Video') {
      if (item.embed) {
        return `<iframe src="${safe(item.embed)}" title="${safe(item.title)}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      }
      if (item.video) {
        return `<video src="${safe(item.video)}" controls playsinline preload="metadata"></video>`;
      }
    }
    if (item.src) {
      return `<img src="${safe(item.src)}" alt="${safe(item.title)}" decoding="async" />`;
    }
    return `<div class="viewer-placeholder" style="--preview-accent:${safe(item.accent || '')}"><span>${safe(initials(item))}</span></div>`;
  }

  function openViewer(id) {
    const item = data.items.find((entry) => entry.id === id);
    if (!item) return;
    state.selected = id;
    renderGallery();
    renderInspector();
    els.viewerFile.textContent = item.file;
    els.viewerKind.textContent = item.kind;
    els.viewerTitle.textContent = item.title;
    els.viewerDescription.textContent = item.description;
    els.viewerStage.innerHTML = viewerMedia(item);
    els.viewer.classList.add('is-open');
    els.viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    els.viewerClose.focus();
  }

  function closeViewer() {
    els.viewer.classList.remove('is-open');
    els.viewer.setAttribute('aria-hidden', 'true');
    els.viewerStage.innerHTML = '';
    document.body.style.overflow = '';
  }

  function setTheme(theme) {
    state.theme = theme === 'light' ? 'light' : 'dark';
    els.root.dataset.theme = state.theme;
    localStorage.setItem('portfolio:theme', state.theme);
  }

  function searchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter((item) => [
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
    if (!results.length) {
      els.paletteResults.innerHTML = `<div class="palette-empty">No files match “${safe(query)}”.</div>`;
      return;
    }
    els.paletteResults.innerHTML = results.map((item, index) => `
      <button class="palette-result ${index === 0 ? 'is-active' : ''}" data-result="${safe(item.id)}" type="button">
        <span class="result-thumb" style="--preview-accent:${safe(item.accent || '')}">${mediaThumb(item)}</span>
        <span class="result-main"><strong>${safe(item.title)}</strong><span>${safe(item.file)}</span></span>
        <span class="result-kind">${safe(item.kind)}</span>
      </button>
    `).join('');
    els.paletteResults.querySelectorAll('[data-result]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = data.items.find((entry) => entry.id === button.dataset.result);
        if (!item) return;
        closeSearch();
        navigate(item.folder);
        openViewer(item.id);
      });
    });
  }

  function openSearch() {
    renderSearch('');
    els.commandPalette.classList.add('is-open');
    els.commandPalette.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => els.searchInput.focus());
  }

  function closeSearch() {
    els.commandPalette.classList.remove('is-open');
    els.commandPalette.setAttribute('aria-hidden', 'true');
    els.searchInput.value = '';
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
  els.searchInput.addEventListener('input', () => renderSearch(els.searchInput.value));

  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
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

  setTheme(state.theme);
  const initialFolder = location.hash.replace(/^#\//, '') || 'all';
  navigate(initialFolder, false);
})();
