'use strict';

(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function (_) {
      console.log('service worker is all cool 🐳');
    }).catch(function (e) {
      console.error('service worker is not so cool 🔥', e);
      throw e;
    });

    if (navigator.serviceWorker.controller) {
      // Correctly prompt the user to reload during SW phase change.
      navigator.serviceWorker.controller.onstatechange = function (e) {
        if (e.target.state === 'redundant') {
          document.querySelector('#reload-prompt').style.visibility = 'visible';
        }
      };
    }
  }

  function platformDetect() {
    var agent = navigator.userAgent.toLowerCase();
    var isAndroid = agent.indexOf("android") > -1;
    if (isAndroid) {
      return 'google';
    }
    return 'apple';
  }

  window.app = {
    baseImgPath: './images/emoji',
    brush: {
      platform: platformDetect(),
      color: 'green-dark',
      name: emojiMap[platformDetect()]['green-dark'][0]
    },
    brushSize: {
      min: 5,
      max: 200
    },
    getBrushSizePercent: function getBrushSizePercent() {
      var val = arguments.length <= 0 || arguments[0] === undefined ? window.app.brushSize.val : arguments[0];

      return val / (this.brushSize.max - this.brushSize.min);
    },
    undos: [],
    redos: []
  };

  // Init the starting brush val to be 50%.
  window.app.brushSize.val = (window.app.brushSize.max - window.app.brushSize.min) / 2;

  var drawCanvas = document.querySelector('draw-canvas');
  var brushChangeTimeoutId = void 0;
  var brushPreview = document.querySelector('brush-preview');

  document.body.addEventListener('menu-action', handlePageAction);
  document.body.addEventListener('brush-change', handleBrushChange);

  function handlePageAction(e) {
    switch (e.detail) {
      case 'apple-emoji':
        changePlatform('apple');
        break;
      case 'google-emoji':
        changePlatform('google');
        break;
      case 'dashboard-menu':
        onFooterMenuClick('dashboard-open', 0);
        break;
      case 'brush-pick':
        onFooterMenuClick('brush-picker-open', 2);
        showBrushPreviewIfMenuOpen();
        break;
      case 'size':
        onFooterMenuClick('size-picker-open', 1);
        showBrushPreviewIfMenuOpen();
        break;
      case 'save':
        drawCanvas.download();
        closeAllMenus();
        break;
      case 'reset':
        if (!window.confirm('All progress will be lost, are you sure?')) {
          return;
        }

        window.app.undos = [];
        window.app.redos = [];
        drawCanvas.clearCanvas();
        closeAllMenus();
        break;
      case 'overlay-close':
        closeAllMenus();
        break;
      case 'undo':
        drawCanvas.undo();
        break;
      case 'redo':
        drawCanvas.redo();
        break;
      default:
        console.warn('unhanded detail, ' + e.detail);
    }
  };

  function changePlatform(platform) {
    window.app.brush.platform = platform;
    document.getElementById('apple').classList.toggle('active', platform == 'apple');
    document.getElementById('google').classList.toggle('active', platform == 'google');
    window.app.brush.name = emojiMap[platform][window.app.brush.color][0];
  }

  function getBrushSrcPath() {
    return window.app.baseImgPath + '/' + window.app.brush.platform + '/' + window.app.brush.color + '/' + window.app.brush.name;
  }

  function handleBrushChange(e) {
    if (e.detail.brush) {
      window.app.brush = e.detail.brush;
    }

    if (e.detail.brushSize !== undefined) {
      window.app.brushSize.val = e.detail.brushSize;
    }

    brushPreview.updatePreviewState(window.app.getBrushSizePercent(), getBrushSrcPath());
  }

  function closeAllMenus() {
    ['brush-picker-open', 'size-picker-open', 'dashboard-open', 'menu-open'].forEach(function (v) {
      document.body.classList.remove(v);
    });

    brushPreview.hide();
  }

  function showBrushPreviewIfMenuOpen() {
    if (document.body.classList.contains('menu-open')) {
      brushPreview.show();
    }
  }

  function onFooterMenuClick(klass, index) {
    var paneAlreadyOpen = document.body.classList.contains(klass);
    var x = index * -100;
    if (document.body.classList.contains('menu-open')) {
      closeAllMenus();
    }

    if (!paneAlreadyOpen) {
      document.body.classList.add('menu-open');
      document.body.classList.add(klass);
      document.getElementById('pane-slider').style.transform = 'translateX(' + x + '%)';
    }
  }
})();