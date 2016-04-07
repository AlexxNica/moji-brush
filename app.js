(function() {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(_ => {
      console.log('service worker is is all cool 🐳');
    }).catch(e => {
      console.error('service worker is not so cool 🔥', e);
      throw e;
    })
  }

  window.app = {
    activeBrush: '0x1F428',
    brushSize: {
      min: 40,
      max: 245,
      val: 84,
    },
  };

  let drawCanvas = document.querySelector('draw-canvas');

  document.body.addEventListener('menu-action', handlePageAction);
  document.body.addEventListener('brush-change', handleBrushChange);

  function handlePageAction(e) {
    switch (e.detail) {
      case 'large-menu':
        onFooterMenuClick('menu-open');
        break;
      case 'brush-pick':
        onFooterMenuClick('brush-picker-open');
        break;
      case 'size':
        onFooterMenuClick('size-picker-open');
        break;
      case 'reset':
        drawCanvas.clearCanvas();
        closeAllMenus();
        break;
      default:
        console.warn(`unhanded detail, ${e.detail}`);
    }
  };

  function handleBrushChange(e) {
    window.app.activeBrush = e.detail;
    closeAllMenus();
  }

  function closeAllMenus() {
    ['brush-picker-open',
    'size-picker-open',
    'menu-open',
    'pane-open',].forEach(v => {
      document.body.classList.remove(v);
    });
  }

  function onFooterMenuClick(klass) {
    let paneAlreadyOpen = document.body.classList.contains(klass);

    if (document.body.classList.contains('pane-open')) {
      closeAllMenus();
    }

    if (!paneAlreadyOpen) {
      document.body.classList.add('pane-open');
      document.body.classList.add(klass);
    }
  }
})();
