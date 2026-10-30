/**
 * Pawn Launcher — script.js
 * • Mobile nav toggle
 * • Download modal (open / close / focus trap / keyboard)
 * • Smooth scroll
 */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll progress ───────────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ── Pointer aura ───────────────────────────────────────── */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const aura = document.createElement('div');
    aura.className = 'pointer-aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.appendChild(aura);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let visible = false;

    const moveAura = event => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        currentX = targetX;
        currentY = targetY;
        visible = true;
        aura.classList.add('is-visible');
      }
    };

    const animateAura = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      aura.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      window.requestAnimationFrame(animateAura);
    };

    document.addEventListener('pointermove', moveAura, { passive: true });
    document.addEventListener('pointerleave', () => {
      visible = false;
      aura.classList.remove('is-visible');
    });
    window.requestAnimationFrame(animateAura);
  }

  /* ── Reveal content as it enters the viewport ───────────── */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealItems = document.querySelectorAll(
      '.hero__content, .hero__visual, .section-header, .content-section__intro, ' +
      '.feature-card, .step-card, .requirements-table-wrap, .faq-item, ' +
      '.screenshot-item, .form-card, .contact-detail, .prose'
    );
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px' });

    revealItems.forEach((item, index) => {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', `${Math.min(index * 35, 280)}ms`);
      revealObserver.observe(item);
    });
  }

  /* ── Single-page information panels ─────────────────────── */
  const panelOverlay = document.getElementById('info-panel-overlay');
  const panel = panelOverlay && panelOverlay.querySelector('.info-panel');
  const panelClose = document.getElementById('info-panel-close');
  const panelTitle = document.getElementById('info-panel-title');
  const panelLabel = document.getElementById('info-panel-label');
  const panelContent = document.getElementById('info-panel-content');
  const panelTitles = {
    'about-panel': ['About Pawn Launcher', 'The project'],
    'contact-panel': ['Contact', 'Get in touch'],
    'privacy-panel': ['Privacy Policy', 'Your privacy'],
    'terms-panel': ['Terms & Disclaimer', 'Before downloading']
  };
  let lastPanelTrigger = null;

  function closeInfoPanel() {
    if (!panelOverlay) return;
    panelOverlay.classList.remove('is-open');
    panelOverlay.setAttribute('aria-hidden', 'true');
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    document.body.style.overflow = document.body.dataset.previousPanelOverflow || '';
    delete document.body.dataset.previousPanelOverflow;
    if (lastPanelTrigger) lastPanelTrigger.focus();
  }

  function openInfoPanel(panelId, trigger) {
    if (!panelOverlay || !panelContent || !panelTitles[panelId]) return;
    const template = document.getElementById(`${panelId}-template`);
    if (!template) return;
    lastPanelTrigger = trigger;
    panelTitle.textContent = panelTitles[panelId][0];
    panelLabel.textContent = panelTitles[panelId][1];
    panelContent.replaceChildren(template.content.cloneNode(true));
    panelOverlay.classList.add('is-open');
    panelOverlay.setAttribute('aria-hidden', 'false');
    document.body.dataset.previousPanelOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.history.replaceState(null, '', `#${panelId}`);
    window.setTimeout(() => panel.focus(), 40);
  }

  if (panelOverlay && panel) {
    document.querySelectorAll('[data-panel]').forEach(trigger => {
      trigger.addEventListener('click', event => {
        event.preventDefault();
        openInfoPanel(trigger.dataset.panel, trigger);
      });
    });
    if (panelClose) panelClose.addEventListener('click', closeInfoPanel);
    panelOverlay.addEventListener('click', event => {
      if (event.target === panelOverlay) closeInfoPanel();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && panelOverlay.classList.contains('is-open')) closeInfoPanel();
    });
  }

  /* ── Mobile nav ─────────────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ── Download modal ─────────────────────────────────────── */
  const overlay   = document.getElementById('download-modal');
  const modal     = overlay && overlay.querySelector('.modal');
  const closeBtn  = document.getElementById('modal-close');
  const termsConsent = document.getElementById('terms-consent');
  const downloadLink = document.getElementById('modal-download-link');

  // All buttons that should open the modal
  const openers = [
    document.getElementById('open-download'),
    document.getElementById('hero-download-btn'),
    document.getElementById('cta-download-btn'),
  ].filter(Boolean);

  if (overlay && modal) {

    function updateDownloadState() {
      if (!termsConsent || !downloadLink) return;
      const accepted = termsConsent.checked;
      downloadLink.classList.toggle('is-disabled', !accepted);
      downloadLink.setAttribute('aria-disabled', String(!accepted));
      downloadLink.textContent = accepted
        ? 'Download Pawn Launcher'
        : 'Agree to Terms to Download';
    }

    function openModal() {
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-open');
      if (termsConsent) termsConsent.checked = false;
      updateDownloadState();
      document.body.dataset.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus the modal panel after animation begins
      setTimeout(() => modal.focus(), 50);
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = document.body.dataset.previousOverflow || '';
      delete document.body.dataset.previousOverflow;
      // Return focus to last opener
      if (lastOpener) lastOpener.focus();
    }

    let lastOpener = null;

    openers.forEach(btn => {
      btn.addEventListener('click', () => {
        lastOpener = btn;
        openModal();
      });
    });

    // Close on button
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (termsConsent) termsConsent.addEventListener('change', updateDownloadState);
    if (downloadLink) {
      downloadLink.addEventListener('click', event => {
        if (!termsConsent || !termsConsent.checked) {
          event.preventDefault();
          if (termsConsent) termsConsent.focus();
        }
      });
    }

    // Close on overlay click (outside modal box)
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Focus trap inside modal
    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('is-open') || e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // data-home attribute'u olanlar home transition tarafından handle ediliyor
    if (anchor.hasAttribute('data-home') || anchor.hasAttribute('data-panel')) return;

    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ── Animated page transition (logo + Home link) ─────────── */
  function triggerHomeTransition(e) {
    if (window.location.pathname.split('/').pop() !== 'index.html' &&
        window.location.pathname.split('/').pop() !== '') {
      return;
    }
    e.preventDefault();

    const transOverlay = document.getElementById('page-transition');
    if (!transOverlay) return;

    const atTop = window.scrollY < 10;

    // Eğer zaten en tepedeyse sadece kısa bir flash
    if (atTop) {
      transOverlay.classList.add('transition-active');
      setTimeout(() => transOverlay.classList.remove('transition-active'), 300);
      return;
    }

    // Fade out → scroll to top → fade in
    transOverlay.classList.add('transition-active');

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 220);

    setTimeout(() => {
      transOverlay.classList.remove('transition-active');
    }, 500);
  }

  // Logo linki
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) logoLink.addEventListener('click', triggerHomeTransition);

  // "Home" nav linki — class veya text ile değil, doğrudan data attribute ile bul
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    // index.html, /, veya boş — hepsi "home" demek
    if ((href === 'index.html' || href === '/' || href === './index.html') &&
        (window.location.pathname.split('/').pop() === 'index.html' ||
         window.location.pathname.split('/').pop() === '')) {
      // href'i # yaparak tarayıcının navigate etmesini tamamen engelle
      link.setAttribute('href', '#');
      link.addEventListener('click', triggerHomeTransition);
    }
  });

})();
