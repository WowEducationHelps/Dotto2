(function () {
  var screens = document.querySelectorAll('.screen');
  var video = document.getElementById('splash-video');
  var moved = false, timer;
  function show(id) {
    if (id !== 'splash') { moved = true; clearTimeout(timer); video.pause(); }
    for (var i = 0; i < screens.length; i++) screens[i].classList.toggle('is-active', screens[i].id === id);
    window.scrollTo(0, 0);
  }
  function leaveSplash() { if (!moved) show('welcome'); }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go]');
    if (el) { e.preventDefault(); show(el.getAttribute('data-go')); }
    if (e.target.closest('[aria-disabled="true"]')) e.preventDefault();
  });
  function fallback() {
    if (moved) return;
    video.pause(); video.classList.remove('is-playing');
    clearTimeout(timer); timer = setTimeout(leaveSplash, 2000);
  }
  video.addEventListener('playing', function () {
    if (moved) { video.pause(); return; }
    video.classList.add('is-playing');
    clearTimeout(timer); timer = setTimeout(leaveSplash, 6000);
  });
  video.addEventListener('ended', leaveSplash);
  video.addEventListener('error', fallback);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) fallback();
  else {
    video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.src = matchMedia('(orientation: portrait)').matches ? './media/intro-portrait.mp4' : './media/intro-landscape.mp4';
    timer = setTimeout(fallback, 8000);
    video.load();
    var play = video.play();
    if (play && play.catch) play.catch(fallback);
  }

  var button = document.getElementById('install-button');
  var help = document.getElementById('install-help');
  var panel = document.getElementById('install-panel');
  var promptEvent;
  var standalone = matchMedia('(display-mode: standalone)');
  function installed() { panel.hidden = standalone.matches || navigator.standalone === true; }
  installed();
  if (standalone.addEventListener) standalone.addEventListener('change', installed);
  var hosted = /^https?:$/.test(location.protocol) && window.isSecureContext;
  function instructions() {
    if (!hosted) return 'To install, open the published HTTPS website in your phone’s browser. A downloaded HTML file or ZIP preview cannot be installed.';
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'In Safari, tap Share → Add to Home Screen → Add. Enable Open as Web App if shown.';
    return 'In Chrome, open the browser menu → Add to Home screen → Install. If you opened this inside another app, first open the link in Chrome.';
  }
  help.textContent = instructions();
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); promptEvent = e; help.textContent = 'Install Do. for a full-screen workspace and offline access.';
  });
  button.addEventListener('click', async function () {
    if (!promptEvent) { help.textContent = instructions(); return; }
    var event = promptEvent; promptEvent = null;
    try { await event.prompt(); await event.userChoice; } catch (_) {}
    help.textContent = instructions();
  });
  window.addEventListener('appinstalled', function () { panel.hidden = true; promptEvent = null; });
  if (hosted && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(function () {
      help.textContent = 'Offline setup failed. Reload while online, then use your browser menu to install.';
    });
  }
})();
