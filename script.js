/**
 * Pawn Launcher — script.js (Enhanced)
 * • Particles background
 * • Scroll reveal animations
 * • Mouse follow glow
 * • Smart download (checks for PawnLauncher_Setup.exe)
 * • Download modal
 * • Navbar scroll effect
 * • Toast notifications
 * • Smooth scroll
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     PARTICLES BACKGROUND
  ════════════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;

        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }

        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        if (this.life <= 0) this.reset();
      }
      draw() {
        const lifeRatio = this.life / this.maxLife;
        const alpha = this.opacity * (lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 0, ${alpha})`;
        ctx.fill();
      }
    }

    // Create particles
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    // Draw connections
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 107, 0, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    // Track mouse for particles
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  /* ══════════════════════════════════════════════
     SCROLL REVEAL ANIMATIONS
  ════════════════════════════════════════════════ */
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay * 120);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════
     MOUSE FOLLOW GLOW
  ════════════════════════════════════════════════ */
  function initMouseGlow() {
    if (window.matchMedia('(max-width: 640px)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);

    let isVisible = false;
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      if (!isVisible) {
        glow.classList.add('active');
        isVisible = true;
      }
    });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('active');
      isVisible = false;
    });
  }

  /* ══════════════════════════════════════════════
     NAVBAR SCROLL EFFECT
  ════════════════════════════════════════════════ */
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ══════════════════════════════════════════════
     SMART DOWNLOAD — Check for PawnLauncher_Setup.exe
  ════════════════════════════════════════════════ */
  const EXE_FILENAME = 'PawnLauncher_Setup.exe';
  let fileAvailable = false;

  async function checkFileAvailability() {
    const statusEl = document.getElementById('file-status');
    const modalLink = document.getElementById('modal-download-link');

    try {
      const response = await fetch(EXE_FILENAME, { method: 'HEAD' });
      if (response.ok) {
        fileAvailable = true;
        if (statusEl) {
          statusEl.classList.add('available');
          statusEl.classList.remove('unavailable');
          statusEl.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Ready to download
          `;
        }
        if (modalLink) {
          modalLink.href = EXE_FILENAME;
          modalLink.setAttribute('download', EXE_FILENAME);
          modalLink.classList.remove('disabled');
          modalLink.setAttribute('aria-label', `Download ${EXE_FILENAME} for Windows`);
        }
      } else {
        throw new Error('File not found');
      }
    } catch {
      fileAvailable = false;
      if (statusEl) {
        statusEl.classList.add('unavailable');
        statusEl.classList.remove('available');
        statusEl.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          File not available
        `;
      }
      if (modalLink) {
        modalLink.href = '#';
        modalLink.removeAttribute('download');
        modalLink.classList.add('disabled');
      }
    }
  }

  /* ══════════════════════════════════════════════
     TOAST NOTIFICATION
  ════════════════════════════════════════════════ */
  function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const textEl = toast.querySelector('.toast__text');
    if (textEl) textEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  /* ══════════════════════════════════════════════
     DOWNLOAD MODAL
  ════════════════════════════════════════════════ */
  const overlay = document.getElementById('download-modal');
  const modal = overlay && overlay.querySelector('.modal');
  const closeBtn = document.getElementById('modal-close');
  const modalLink = document.getElementById('modal-download-link');

  const openers = [
    document.getElementById('open-download'),
    document.getElementById('hero-download-btn'),
    document.getElementById('cta-download-btn'),
  ].filter(Boolean);

  if (overlay && modal) {
    let lastOpener = null;

    function openModal() {
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => modal.focus(), 50);
      // Check file availability when modal opens
      checkFileAvailability();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastOpener) lastOpener.focus();
    }

    openers.forEach(btn => {
      btn.addEventListener('click', () => {
        lastOpener = btn;
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Download link click handler
    if (modalLink) {
      modalLink.addEventListener('click', (e) => {
        if (!fileAvailable) {
          e.preventDefault();
          showToast('File is not available yet. Please check back later.', 4000);
          return;
        }
        // Show success toast and close modal
        showToast('Download started! Check your downloads folder.');
        setTimeout(() => closeModal(), 300);
      });
    }

    // Focus trap
    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('is-open') || e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ══════════════════════════════════════════════
     MOBILE NAV
  ════════════════════════════════════════════════ */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

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

  /* ══════════════════════════════════════════════
     SMOOTH SCROLL
  ════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

  /* ══════════════════════════════════════════════
     HOME TRANSITION
  ════════════════════════════════════════════════ */
  function triggerHomeTransition(e) {
    e.preventDefault();

    const transOverlay = document.getElementById('page-transition');
    if (!transOverlay) return;

    const atTop = window.scrollY < 10;

    if (atTop) {
      transOverlay.classList.add('transition-active');
      setTimeout(() => transOverlay.classList.remove('transition-active'), 300);
      return;
    }

    transOverlay.classList.add('transition-active');

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 220);

    setTimeout(() => {
      transOverlay.classList.remove('transition-active');
    }, 500);
  }

  const logoLink = document.querySelector('.logo-link');
  if (logoLink) logoLink.addEventListener('click', triggerHomeTransition);

  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === 'index.html' || href === '/' || href === './index.html') {
      link.setAttribute('href', '#');
      link.addEventListener('click', triggerHomeTransition);
    }
  });

  /* ══════════════════════════════════════════════
     INIT ALL
  ════════════════════════════════════════════════ */
  // Run on DOM ready
  initParticles();
  initScrollReveal();
  initMouseGlow();
  initNavbarScroll();

  // Initial file check
  checkFileAvailability();

})();