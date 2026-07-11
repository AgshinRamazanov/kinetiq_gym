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
    return true;
  }

  function closeSheet(sheet) {
    if (!sheet) return false;
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    const video = sheet.querySelector('video');
    if (video) video.pause();
    return true;
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
    sheet.addEventListener('click', event => {
      if (event.target === sheet) closeSheet(sheet);
    });
  });

  global.Kinetiq = Object.assign(global.Kinetiq || {}, {
    ui: Object.freeze({ navigate, openSheet, closeSheet })
  });
  global.navigate = navigate;
})(window, document);
