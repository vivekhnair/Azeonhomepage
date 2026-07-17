/* ==========================================================================
   AZEON AI — CINEMATIC PARALLAX SCROLL ENGINE v2.0
   Sections overlap. Depth layers move independently.
   Foreground / Midground / Background at different speeds.
   ========================================================================== */

class AzeonParallaxEngine {
  constructor() {
    this.scenes = [];
    this.scrollY = 0;
    this.rafId = null;
    this.activeScene = 1;
    this.ticking = false;

    // Parallax multipliers for each depth layer
    this.PARALLAX = {
      bg:  0.35,   // background  — moves slowest (feels furthest away)
      mid: 0.62,   // midground   — medium drift
      fg:  0.88,   // foreground content — nearly locked but breathes slightly
    };

    this.initLenis();
    this.collectScenes();
    this.setupScrollListener();
    this.initGSAPScroll();
    this.tick();
  }

  /* ─── Lenis smooth scroll ─── */
  initLenis() {
    this.lenis = new Lenis({
      duration: 1.4,
      easing: t => 1 - Math.pow(1 - t, 3.5),  // cubic ease-out — cinematic deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
      infinite: false,
    });

    this.lenis.on('scroll', ({ scroll }) => {
      this.scrollY = scroll;
      ScrollTrigger.update();
      if (!this.ticking) {
        this.ticking = true;
        requestAnimationFrame(() => {
          this.updateParallax();
          this.evaluateActiveScene();
          this.ticking = false;
        });
      }
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  /* ─── Collect all scene DOM references ─── */
  collectScenes() {
    const tracks = document.querySelectorAll('.scene-scroll-track');
    this.scenes = Array.from(tracks).map((track, i) => {
      const section  = track.querySelector('.museum-scene');
      const layerBg  = track.querySelector('.scene-layer-bg');
      const layerMid = track.querySelector('.scene-layer-mid');
      const layerFg  = track.querySelector('.scene-layer-fg');
      return { track, section, layerBg, layerMid, layerFg, index: i + 1 };
    });
  }

  /* ─── Native scroll fallback ─── */
  setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
    }, { passive: true });
    setTimeout(() => this.evaluateActiveScene(), 200);
  }

  /* ─── GSAP ScrollTrigger Reveal Animations ─── */
  initGSAPScroll() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Load Animations
    gsap.from('.invitation-container .hero-trust-line, .invitation-container h1, .invitation-container .hero-subline, .invitation-container .hero-cta-group, .invitation-container .hero-micro-trust', {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out'
    });

    // Content block staggered reveals on scroll
    const textBlocks = document.querySelectorAll('.text-block');
    textBlocks.forEach(block => {
      gsap.from(block.querySelectorAll('.badge, h2, p, .section-cta-group, .decision-evidence-list, .integration-count-bar'), {
        y: 35,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Graphic panels fade/zoom reveal on scroll
    const graphics = document.querySelectorAll('.ledger-sheet, .lexical-text-box, .decision-panel, .orbital-universe-container, .calculator-wrapper, .governance-sheet, .proof-card');
    graphics.forEach(graphic => {
      gsap.from(graphic, {
        y: 45,
        opacity: 0,
        scale: 0.98,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: graphic,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  /* ─── Main parallax computation ─── */
  updateParallax() {
    const vh = window.innerHeight;

    this.scenes.forEach(scene => {
      const rect = scene.track.getBoundingClientRect();

      // How far through this scene's scroll-track is the viewport?
      // 0 = section just entering top, 1 = section fully scrolled past
      const sectionScrolled = -rect.top;  // px scrolled within this track
      const trackHeight = rect.height - vh;
      const progress = Math.max(-0.5, Math.min(1.5, sectionScrolled / Math.max(1, trackHeight)));

      // Correct parallax offsets: translate down (positive) to resist scroll and feel further away
      const bgOffset  = Math.max(0, sectionScrolled) * 0.45;
      const midOffset = Math.max(0, sectionScrolled) * 0.20;
      const fgOffset  = 0; // Keep content centered in the viewport

      // Apply GPU-composited transforms
      if (scene.layerBg)  scene.layerBg.style.transform  = `translate3d(0, ${bgOffset.toFixed(2)}px, 0)`;
      if (scene.layerMid) scene.layerMid.style.transform = `translate3d(0, ${midOffset.toFixed(2)}px, 0)`;
      if (scene.layerFg)  scene.layerFg.style.transform  = `translate3d(0, ${fgOffset.toFixed(2)}px, 0)`;

      // Emergence opacity — section fades in as it enters, full opacity mid-scroll
      const enterProgress = Math.max(0, Math.min(1, (rect.top < vh ? 1 - rect.top / vh : 0)));
      if (scene.section) {
        // Scale: very subtle — foreground feels closer as section takes over
        const scale = 0.97 + enterProgress * 0.03;
        scene.section.style.setProperty('--scene-enter', enterProgress.toFixed(3));
      }

      // Lexical word highlighting for Scene 3
      if (scene.index === 3) {
        this.handleScene3Words(progress);
      }
    });
  }

  handleScene3Words(progress) {
    const spanSentiment = document.querySelector('.span-sentiment');
    const spanCatalog   = document.querySelector('.span-catalog');
    const spanIntent    = document.querySelector('.span-intent');
    if (!spanSentiment) return;

    const itemSentiment = document.querySelector('.legend-item--sentiment');
    const itemCatalog   = document.querySelector('.legend-item--catalog');
    const itemIntent    = document.querySelector('.legend-item--intent');

    const p = Math.max(0, Math.min(1, progress));
    
    if (p > 0.20) {
      spanSentiment.classList.add('active-sentiment');
      if (itemSentiment) itemSentiment.classList.add('active');
    } else {
      spanSentiment.classList.remove('active-sentiment');
      if (itemSentiment) itemSentiment.classList.remove('active');
    }
    
    if (p > 0.50) {
      spanCatalog.classList.add('active-catalog');
      if (itemCatalog) itemCatalog.classList.add('active');
    } else {
      spanCatalog.classList.remove('active-catalog');
      if (itemCatalog) itemCatalog.classList.remove('active');
    }
    
    if (p > 0.78) {
      spanIntent.classList.add('active-intent');
      if (itemIntent) itemIntent.classList.add('active');
    } else {
      spanIntent.classList.remove('active-intent');
      if (itemIntent) itemIntent.classList.remove('active');
    }
  }

  /* ─── Active scene detection → fires canvas engine events ─── */
  evaluateActiveScene() {
    const vh = window.innerHeight;
    let nearest = 1;
    let minDist = Infinity;

    this.scenes.forEach(scene => {
      if (!scene.section) return;
      const rect = scene.section.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - vh / 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = scene.index;
      }
    });

    if (nearest !== this.activeScene) {
      this.activeScene = nearest;
      this.fireSceneEvents(nearest);
    }

    // Sticky micro CTA (fires at scene 5+)
    const header = document.querySelector('header');
    if (header) {
      if (nearest >= 5) header.classList.add('micro-cta-active');
      else header.classList.remove('micro-cta-active');
    }
  }

  fireSceneEvents(sceneIndex) {
    window.dispatchEvent(new CustomEvent('azeonSceneTransition', { detail: { scene: sceneIndex } }));

    const state = sceneIndex >= 4 ? 'certainty' : 'chaos';
    window.dispatchEvent(new CustomEvent('azeonStateChange', { detail: { state } }));

    // Update active scene class on DOM elements
    document.querySelectorAll('.museum-scene').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(`scene-${sceneIndex}`);
    if (el) el.classList.add('active');

    // Update registry timeline dots
    document.querySelectorAll('.registry-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === sceneIndex);
    });
  }

  /* ─── RAF loop to always-run evaluations even without scroll events ─── */
  tick() {
    this.updateParallax();
    this.evaluateActiveScene();
    requestAnimationFrame(() => this.tick());
  }
}

/* ─── Boot ─── */
window.addEventListener('DOMContentLoaded', () => {
  window.azeonMotion = new AzeonParallaxEngine();
  window.azeonMagnetic = new AzeonMagneticSystem();
});

/* ==========================================================================
   AZEON MAGNETIC MOTION SYSTEM
   Magnetic hover, mouse-radial glows, staggered reveals
   ========================================================================== */

class AzeonMagneticSystem {
  constructor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.rafActive = false;

    this.magneticTargets = [];
    this.glowTargets = [];

    this.init();
  }

  init() {
    this.collectTargets();
    this.bindMouseMove();
    this.initIntersectionReveal();
    this.initButtonGlowTracking();
  }

  /* ── Collect all magnetic elements ── */
  collectTargets() {
    // Magnetic pull targets (buttons, primary CTAs)
    const magneticSels = [
      '.btn-filled', '.btn-ghost', '.decision-btn',
      '.orbital-hub', '.cost-card.highlight'
    ];

    magneticSels.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.dataset.magnetic = true;
        this.magneticTargets.push({
          el,
          strength: el.classList.contains('orbital-hub') ? 0.28 : 0.18,
          baseTransform: ''
        });
      });
    });
  }

  /* ── Global mouse tracker ── */
  bindMouseMove() {
    window.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      // Update CSS vars for ghost button radial glow
      this.glowTargets.forEach(({ el }) => {
        const rect = el.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
      });
    }, { passive: true });

    // Magnetic RAF loop
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => this.startMagnetic(el));
      el.addEventListener('mouseleave', () => this.resetMagnetic(el));
    });
  }

  startMagnetic(el) {
    const target = this.magneticTargets.find(t => t.el === el);
    if (!target) return;

    const animate = () => {
      if (!el.matches(':hover')) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (this.mouseX - cx) * target.strength;
      const dy = (this.mouseY - cy) * target.strength;

      el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) translateY(-2px) scale(1.02)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  resetMagnetic(el) {
    // Spring back — CSS transition handles the ease
    el.style.transform = '';
  }

  /* ── Ghost button radial glow tracking ── */
  initButtonGlowTracking() {
    document.querySelectorAll('.btn-ghost').forEach(el => {
      this.glowTargets.push({ el });
    });
  }

  /* ── Intersection reveal — stagger cards on scroll ── */
  initIntersectionReveal() {
    const revealEls = document.querySelectorAll(
      '.cost-card, .governance-sheet-section, .ledger-sheet-row, .text-block h2, .text-block p'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || 0, 10);
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      // Initial hidden state
      if (!el.style.opacity) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${(i % 4) * 80}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${(i % 4) * 80}ms`;
      }
      el.dataset.revealDelay = (i % 4) * 80;
      observer.observe(el);
    });

    /* Stagger cost cards specifically */
    document.querySelectorAll('.cost-card').forEach((card, i) => {
      card.style.setProperty('--card-idx', i);
    });
  }
}

