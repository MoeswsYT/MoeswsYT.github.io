/**
 * Pawn Launcher — script.js
 * • Mobile nav toggle
 * • Download modal (open / close / focus trap / keyboard)
 * • Smooth scroll
 */

(function () {
  'use strict';

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

  // All buttons that should open the modal
  const openers = [
    document.getElementById('open-download'),
    document.getElementById('hero-download-btn'),
    document.getElementById('cta-download-btn'),
  ].filter(Boolean);

  if (overlay && modal) {

    function openModal() {
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // Focus the modal panel after animation begins
      setTimeout(() => modal.focus(), 50);
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
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
    if (anchor.hasAttribute('data-home')) return;

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
    if (href === 'index.html' || href === '/' || href === './index.html') {
      // href'i # yaparak tarayıcının navigate etmesini tamamen engelle
      link.setAttribute('href', '#');
      link.addEventListener('click', triggerHomeTransition);
    }
  });

})();
