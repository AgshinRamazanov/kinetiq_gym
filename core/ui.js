(function bootstrapUi(global, document) {
  'use strict';

  function navigate(id) {
    const screens = document.querySelectorAll('.screen');
    const bottomButtons = document.querySelectorAll('.bottom-nav button[data-nav]');
    const update = () => {
      screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
      bottomButtons.forEach(button => button.classList.toggle('active', button.dataset.nav === id));
      global.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (document.startViewTransition && !global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  function openSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return false;
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    sheet.removeAttribute('inert');
    return true;
  }

  function closeSheet(sheet) {
    if (!sheet) return false;
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.setAttribute('inert', '');
    const video = sheet.querySelector('video');
    if (video) video.pause();
    return true;
  }

  function syncSheetState(sheet) {
    if (!sheet?.matches?.('.sheet')) return;
    const open = sheet.classList.contains('open');
    if (open) {
      if (sheet.getAttribute('aria-hidden') !== 'false') sheet.setAttribute('aria-hidden', 'false');
      sheet.removeAttribute('inert');
    } else {
      if (sheet.getAttribute('aria-hidden') !== 'true') sheet.setAttribute('aria-hidden', 'true');
      if (!sheet.hasAttribute('inert')) sheet.setAttribute('inert', '');
    }
  }

  document.querySelectorAll('[data-nav]').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });
  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => openSheet(button.dataset.open));
  });
  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => closeSheet(button.closest('.sheet')));
  });
  document.querySelectorAll('.sheet').forEach(sheet => {
    syncSheetState(sheet);
    sheet.addEventListener('click', event => {
      if (event.target === sheet) closeSheet(sheet);
    });
  });
  document.addEventListener('click', event => {
    const close = event.target.closest?.('[data-close]');
    if (close) closeSheet(close.closest('.sheet'));
  });
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes') syncSheetState(record.target);
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue;
      const sheets = [node, ...node.querySelectorAll?.('.sheet') || []].filter(item => item.matches?.('.sheet'));
      sheets.forEach(syncSheetState);
    }
  })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-hidden'] });

  global.Kinetiq = Object.assign(global.Kinetiq || {}, {
    ui: Object.freeze({ navigate, openSheet, closeSheet })
  });
  global.navigate = navigate;
})(window, document);
