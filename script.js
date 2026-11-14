/**
 * Pawn Launcher — Minecraft edition
 */
(function () {
'use strict';

const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionOK = () => !reduced.matches;
const hasIO = 'IntersectionObserver' in window;

/* Toasts */
const toastStack = $('#toast-stack');
function toast(msg, opts) {
  if (!toastStack) return;
  opts = opts || {};
  while (toastStack.children.length >= 3) toastStack.firstChild.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.setProperty('--toast-hue', opts.hue || 'var(--xp)');
  const text = document.createElement('span');
  text.className = 'toast__msg';
  text.textContent = msg;
  el.appendChild(text);
  let timer = null;
  const dismiss = () => {
    clearTimeout(timer);
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  };
  if (opts.actionLabel && opts.onAction) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast__action';
    btn.textContent = opts.actionLabel;
    btn.addEventListener('click', () => { opts.onAction(); dismiss(); });
    el.appendChild(btn);
  }
  toastStack.appendChild(el);
  timer = setTimeout(dismiss, opts.duration || 3200);
}

/* Navbar / progress / parallax */
const navbar = $('#navbar');
const progressBar = $('#scroll-progress-bar');
const parallaxEls = $$('[data-parallax]');
let scrollTicking = false;
function onScrollFrame() {
  scrollTicking = false;
  const y = window.scrollY;
  if (navbar) navbar.classList.toggle('scrolled', y > 8);
  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
  }
  if (motionOK() && window.innerWidth > 900) {
    parallaxEls.forEach(el => {
      el.style.transform = 'translate3d(0,' + (y * parseFloat(el.dataset.parallax || 0)).toFixed(1) + 'px,0)';
    });
  }
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(onScrollFrame); }
}, { passive: true });
onScrollFrame();

/* Mobile nav */
const navToggle = $('#nav-toggle');
const navLinks = $('#nav-links');
function closeNav() {
  if (!navLinks) return;
  navLinks.classList.remove('open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', navLinks).forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) closeNav();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 640) closeNav(); });
}

/* Scrollspy */
const spyLinks = $$('[data-spy]');
if (hasIO && spyLinks.length) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      spyLinks.forEach(l => l.classList.toggle('active', l.dataset.spy === en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['features', 'preview', 'faq'].forEach(id => { const s = $('#' + id); if (s) spy.observe(s); });
}

/* Smooth anchors */
$$('a[href^="#"]').forEach(a => {
  if (a.hasAttribute('data-home')) return;
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    closeNav();
    target.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

/* Home transition */
const transOverlay = $('#page-transition');
let transTimers = [];
$$('[data-home]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  closeNav();
  if (!transOverlay || !motionOK()) { window.scrollTo(0, 0); return; }
  transTimers.forEach(clearTimeout); transTimers = [];
  transOverlay.classList.add('transition-active');
  transTimers.push(setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 240));
  transTimers.push(setTimeout(() => transOverlay.classList.remove('transition-active'), 540));
}));

/* Download modal */
const overlay = $('#download-modal');
const modal = overlay && $('.modal', overlay);
const modalClose = $('#modal-close');
let lastOpener = null;
function openModal(opener) {
  if (!overlay || !modal) return;
  lastOpener = opener || null;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.focus(), 60);
}
function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  if (lastOpener) lastOpener.focus();
  overlay.setAttribute('aria-hidden', 'true');
}
$$('[data-open-download]').forEach(btn => btn.addEventListener('click', () => { closeNav(); openModal(btn); }));
if (overlay && modal) {
  if (modalClose) modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const focusable = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
      .filter(el => el.offsetParent !== null || el === modal);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
    closeNav(); if (navToggle) navToggle.focus();
  }
});
$$('[data-download-link]').forEach(a => a.addEventListener('click', () => {
  toast('Download started', { hue: 'var(--gold)' });
  if (overlay && overlay.classList.contains('is-open')) setTimeout(closeModal, 250);
}));

/* Shared demo state */
const nameInput = $('#demo-username');
const versionSelect = $('#demo-version');
const ramInput = $('#set-ram');
const playerNameEls = $$('[data-player-name]');
const versionLabelEls = $$('[data-version-label]');
const ramLabelEls = $$('[data-ram-label]');
const playerName = () => (nameInput && nameInput.value.trim()) || 'Steve';
const versionName = () => (versionSelect && versionSelect.value) || '1.21.4';
const ramValue = () => (ramInput && ramInput.value) || '4';
function syncName() { playerNameEls.forEach(el => { el.textContent = playerName(); }); }
function syncVersion() { versionLabelEls.forEach(el => { el.textContent = versionName(); }); }
function syncRam() {
  ramLabelEls.forEach(el => { el.textContent = ramValue(); });
  const out = $('#ram-out'); if (out) out.textContent = ramValue() + ' GB';
}
if (nameInput) nameInput.addEventListener('input', syncName);
if (versionSelect) versionSelect.addEventListener('change', syncVersion);
if (ramInput) ramInput.addEventListener('input', syncRam);
syncName(); syncVersion(); syncRam();

/* Hero launcher demo */
const launchBtn = $('#demo-launch');
const launchLabel = $('#demo-launch-label');
const statusDot = $('#demo-status-dot');
const statusText = $('#demo-status-text');
const progressWrap = $('#demo-progress');
const progressFill = $('#demo-progress-fill');
const percentEl = $('#demo-percent');
const logEl = $('#demo-log');
const demoVisual = $('.hero__visual');
let demoState = 'idle', demoTimer = null, demoP = 0, demoStep = 0;

function logLine(text, cls) {
  if (!logEl) return;
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = '> ' + text;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}
function setStatus(text, busy) {
  if (statusText) statusText.textContent = text;
  if (statusDot) statusDot.classList.toggle('is-busy', !!busy);
}
function pixelBurst() {
  if (!demoVisual || !launchBtn || !motionOK()) return;
  const vr = demoVisual.getBoundingClientRect(), br = launchBtn.getBoundingClientRect();
  const cx = br.left - vr.left + br.width / 2, cy = br.top - vr.top + br.height / 2;
  const colors = ['#FF6B00', '#FFB020', '#5FD837', '#3FD8D4', '#B44AF0', '#FF4655'];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('span');
    p.className = 'burst-p';
    const ang = (Math.PI * 2 * i) / 14 + Math.random() * .5;
    const dist = 46 + Math.random() * 60;
    p.style.left = cx + 'px'; p.style.top = cy + 'px';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(0) + 'px');
    p.style.setProperty('--dy', (Math.sin(ang) * dist - 24).toFixed(0) + 'px');
    demoVisual.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}
function demoReset(closedMsg) {
  clearInterval(demoTimer); demoTimer = null;
  demoState = 'idle'; demoP = 0; demoStep = 0;
  if (launchBtn) { launchBtn.disabled = false; launchBtn.classList.remove('is-running'); }
  if (launchLabel) launchLabel.textContent = 'LAUNCH';
  if (progressWrap) progressWrap.hidden = true;
  if (progressFill) progressFill.style.width = '0%';
  setStatus('Ready', false);
  if (closedMsg) logLine(closedMsg, 'log-warn');
}
function demoLaunch() {
  if (!launchBtn) return;
  if (demoState === 'launching') return;
  if (demoState === 'running') { demoReset('Stopped'); return; }
  demoState = 'launching'; demoP = 0; demoStep = 0;
  launchBtn.disabled = true;
  if (launchLabel) launchLabel.textContent = 'LAUNCHING…';
  if (logEl) { logEl.hidden = false; logEl.innerHTML = ''; }
  if (progressWrap) progressWrap.hidden = false;
  if (progressFill) progressFill.style.width = '0%';
  if (percentEl) percentEl.textContent = '0%';
  setStatus('Launching ' + versionName() + '…', true);
  const steps = [
    { p: 12, t: 'Signing in…', c: 'log-info' },
    { p: 34, t: 'Fetching ' + versionName() + '…', c: 'log-info' },
    { p: 58, t: 'RAM: ' + ramValue() + ' GB', c: 'log-info' },
    { p: 82, t: 'Assets OK', c: 'log-ok' },
    { p: 100, t: 'Starting game…', c: 'log-ok' }
  ];
  const finish = () => {
    clearInterval(demoTimer); demoTimer = null;
    demoState = 'running';
    launchBtn.disabled = false;
    launchBtn.classList.add('is-running');
    if (launchLabel) launchLabel.textContent = 'STOP';
    setStatus('Running — ' + versionName(), false);
    pixelBurst();
    toast('Launched (demo)', { hue: 'var(--xp)' });
  };
  if (!motionOK()) {
    steps.forEach(s => logLine(s.t, s.c));
    if (progressFill) progressFill.style.width = '100%';
    if (percentEl) percentEl.textContent = '100%';
    finish(); return;
  }
  demoTimer = setInterval(() => {
    demoP = Math.min(100, demoP + 1.2 + Math.random() * 1.6);
    if (progressFill) progressFill.style.width = demoP + '%';
    if (percentEl) percentEl.textContent = Math.floor(demoP) + '%';
    while (demoStep < steps.length && demoP >= steps[demoStep].p) {
      logLine(steps[demoStep].t, steps[demoStep].c); demoStep++;
    }
    if (demoP >= 100) finish();
  }, 55);
}
if (launchBtn) launchBtn.addEventListener('click', demoLaunch);

/* Preview tabs */
const tabs = $$('#preview-tabs [role="tab"]');
const panels = $$('[data-panel]');
const sideBtns = $$('.side-btn[data-tab]');
function activateTab(name, focusTab) {
  tabs.forEach(t => {
    const on = t.dataset.tab === name;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focusTab) t.focus();
  });
  panels.forEach(p => { p.hidden = p.dataset.panel !== name; });
  sideBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === name));
}
tabs.forEach(t => t.addEventListener('click', () => activateTab(t.dataset.tab)));
sideBtns.forEach(b => b.addEventListener('click', () => activateTab(b.dataset.tab)));
const tablist = $('#preview-tabs');
if (tablist) tablist.addEventListener('keydown', e => {
  const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
  let next = null;
  if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  if (next !== null) { e.preventDefault(); activateTab(tabs[next].dataset.tab, true); }
});

/* Preview mini launch */
const previewLaunch = $('#preview-launch');
let plTimer = null, plRunning = false;
if (previewLaunch) previewLaunch.addEventListener('click', () => {
  if (plTimer) return;
  if (plRunning) {
    plRunning = false;
    previewLaunch.classList.remove('is-running');
    previewLaunch.textContent = 'Launch';
    return;
  }
  previewLaunch.textContent = 'Launching…';
  plTimer = setTimeout(() => {
    plTimer = null; plRunning = true;
    previewLaunch.classList.add('is-running');
    previewLaunch.textContent = 'Running ✓';
  }, motionOK() ? 1100 : 0);
});

/* Worlds */
const worldList = $('#world-list');
const addWorldBtn = $('#add-world');
const biomes = ['overworld', 'nether', 'end', 'ocean'];
const newNames = ['Fresh Start', 'Blocky Bay', 'Redstone Lab', 'Cloud Nine'];
let created = 0;
let worlds = [
  { name: 'Hardcore Heart', biome: 'overworld', mode: 'Hardcore', ver: '1.21.4', size: '214 MB' },
  { name: 'Nether Hub', biome: 'nether', mode: 'Survival', ver: '1.21.4', size: '186 MB' },
  { name: 'End City Raid', biome: 'end', mode: 'Survival', ver: '1.20.6', size: '142 MB' },
  { name: 'Blue Horizon', biome: 'ocean', mode: 'Creative', ver: '1.21.4', size: '98 MB' }
];
function renderWorlds() {
  if (!worldList) return;
  worldList.innerHTML = '';
  worlds.forEach((w, i) => {
    const li = document.createElement('li');
    li.className = 'world-row';
    const thumb = document.createElement('span');
    thumb.className = 'world-thumb world-thumb--' + w.biome;
    thumb.setAttribute('aria-hidden', 'true');
    const info = document.createElement('div');
    info.className = 'world-info';
    const h = document.createElement('h4'); h.textContent = w.name;
    const p = document.createElement('p');
    p.textContent = w.mode + ' · ' + w.ver + ' · ' + w.size;
    info.appendChild(h); info.appendChild(p);
    const actions = document.createElement('div');
    actions.className = 'world-actions';
    const play = document.createElement('button');
    play.type = 'button'; play.className = 'world-btn world-btn--play';
    play.dataset.action = 'play'; play.dataset.index = i;
    play.setAttribute('aria-label', 'Play ' + w.name);
    play.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-play"/></svg>';
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'world-btn world-btn--del';
    del.dataset.action = 'delete'; del.dataset.index = i;
    del.setAttribute('aria-label', 'Delete ' + w.name);
    del.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-x"/></svg>';
    actions.appendChild(play); actions.appendChild(del);
    li.appendChild(thumb); li.appendChild(info); li.appendChild(actions);
    worldList.appendChild(li);
  });
}
if (worldList) {
  renderWorlds();
  worldList.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const i = parseInt(btn.dataset.index, 10);
    const w = worlds[i];
    if (!w) return;
    if (btn.dataset.action === 'play') {
      toast('Loading “' + w.name + '”…', { hue: 'var(--diamond)' });
    } else {
      worlds.splice(i, 1);
      renderWorlds();
      toast('Deleted “' + w.name + '”', {
        hue: 'var(--redstone)', actionLabel: 'Undo', duration: 5000,
        onAction: () => { worlds.splice(Math.min(i, worlds.length), 0, w); renderWorlds(); }
      });
    }
  });
}
if (addWorldBtn) addWorldBtn.addEventListener('click', () => {
  if (worlds.length >= 8) { toast('World limit reached', { hue: 'var(--gold)' }); return; }
  const n = created++;
  worlds.push({
    name: newNames[n % newNames.length] + (n >= newNames.length ? ' ' + (n + 1) : ''),
    biome: biomes[n % biomes.length], mode: 'Creative',
    ver: versionName(), size: '0 MB'
  });
  renderWorlds();
  if (worldList) worldList.scrollTop = worldList.scrollHeight;
  toast('World created', { hue: 'var(--xp)' });
});

/* Settings */
const snapshotToggle = $('#set-snapshots');
const themeSelect = $('#set-theme');
const frame = $('#preview-frame');
const snapshotOption = versionSelect && $('option[data-snapshot]', versionSelect);
function syncSnapshots() {
  if (!snapshotOption || !snapshotToggle || !versionSelect) return;
  if (snapshotToggle.checked) {
    if (!snapshotOption.isConnected) versionSelect.appendChild(snapshotOption);
  } else if (snapshotOption.isConnected) {
    if (versionSelect.value === snapshotOption.value) versionSelect.selectedIndex = 0;
    snapshotOption.remove();
  }
  syncVersion();
}
if (snapshotToggle) snapshotToggle.addEventListener('change', syncSnapshots);
if (themeSelect && frame) themeSelect.addEventListener('change', () => { frame.dataset.theme = themeSelect.value; });
const resetBtn = $('#set-reset');
if (resetBtn) resetBtn.addEventListener('click', () => {
  if (ramInput) ramInput.value = 4;
  const fs = $('#set-fullscreen'), ko = $('#set-keepopen');
  if (fs) fs.checked = true;
  if (ko) ko.checked = true;
  if (snapshotToggle) snapshotToggle.checked = true;
  if (themeSelect) themeSelect.value = 'ember';
  if (frame) frame.dataset.theme = 'ember';
  syncRam(); syncSnapshots();
  toast('Defaults restored', { hue: 'var(--xp)' });
});

/* FAQ */
$$('.faq-item').forEach(item => {
  const q = $('.faq-q', item);
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    $$('.faq-item.open').forEach(o => {
      o.classList.remove('open');
      const b = $('.faq-q', o); if (b) b.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
  });
});

/* Count-up */
const counters = $$('.stat-big__num[data-count]');
function runCounter(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals || '0', 10);
  if (!motionOK()) { el.textContent = target.toFixed(dec); return; }
  const t0 = performance.now(), dur = 1400;
  (function tick(t) {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = (target * (1 - Math.pow(1 - k, 3))).toFixed(dec);
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}
if (hasIO) {
  const cio = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
  }), { threshold: .5 });
  counters.forEach(c => cio.observe(c));
} else counters.forEach(runCounter);

/* Reveals */
const revealEls = $$('[data-reveal]');
if (hasIO && motionOK()) {
  const rio = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('revealed'); rio.unobserve(en.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach(el => rio.observe(el));
} else revealEls.forEach(el => el.classList.add('revealed'));

/* Embers */
const canvas = $('#ember-canvas');
const hero = $('.hero');
if (canvas && hero && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  const COLORS = ['255,107,0', '255,176,32', '63,216,212', '95,216,55'];
  let particles = [], raf = null, running = false, last = 0, W = 0, H = 0, heroVisible = true;
  function spawn(anywhere) {
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 8,
      s: 2 + Math.floor(Math.random() * 3), v: 10 + Math.random() * 18,
      sway: .4 + Math.random() * 1.2, phase: Math.random() * Math.PI * 2,
      tw: Math.random() * Math.PI * 2, c: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }
  function resize() {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(60, Math.max(18, Math.floor((W * H) / 22000)));
    particles = Array.from({ length: count }, () => spawn(true));
  }
  function tick(t) {
    if (!running) return;
    const dt = Math.min(50, t - last); last = t;
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.y -= p.v * dt / 1000;
      p.phase += dt * .001 * p.sway;
      p.x += Math.sin(p.phase) * .25;
      p.tw += dt * .002;
      if (p.y < -10) particles[i] = spawn(false);
      ctx.fillStyle = 'rgba(' + p.c + ',' + (0.22 + 0.3 * Math.abs(Math.sin(p.tw))).toFixed(3) + ')';
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    });
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running || !motionOK() || !heroVisible || document.hidden) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
  resize();
  let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(resize, 150); });
  if (hasIO) new IntersectionObserver(en => { heroVisible = en[0].isIntersecting; heroVisible ? start() : stop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if (reduced.addEventListener) reduced.addEventListener('change', () => motionOK() ? start() : stop());
  start();
}

/* CTA pawn */
const ctaPawn = $('#cta-pawn');
if (ctaPawn) ctaPawn.addEventListener('click', () => {
  ctaPawn.classList.remove('hop');
  void ctaPawn.offsetWidth;
  ctaPawn.classList.add('hop');
});

/* Year */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();