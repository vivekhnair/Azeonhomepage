/* ==========================================================================
   AZEON AI — VISUAL DNA ENGINE: Signal Threads
   Near-invisible warm subconscious texture. Typography is the hero.
   ========================================================================== */

class AzeonVisualDNA {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Accessibility: check for prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', e => {
      this.reducedMotion = e.matches;
    });

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.activeScene = 1;
    this.threads = [];
    
    // Performance: scale threads based on viewport width
    this.numThreads = window.innerWidth < 768 ? 6 : 14; 
    this.time = 0;

    this.initialized = false;
    this.isPaused = false;

    this.resize();
    this.initThreads();
    this.bindEvents();
    
    if (!this.reducedMotion) {
      this.loop();
    }
  }

  resize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.width = W;
    this.height = H;
    this.canvas.width = W * this.dpr;
    this.canvas.height = H * this.dpr;
    this.canvas.style.width = W + 'px';
    this.canvas.style.height = H + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    if (this.initialized) {
      this.threads.forEach(t => { t.W = W; t.H = H; });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.resize();
    });

    window.addEventListener('azeonSceneTransition', e => {
      this.activeScene = e.detail.scene;
    });

    // Performance: pause rendering when page is hidden
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });
  }

  initThreads() {
    this.initialized = true;
    for (let i = 0; i < this.numThreads; i++) {
      this.threads.push(new SignalThread(i, this.numThreads, this.width, this.height));
    }
  }

  loop() {
    if (this.reducedMotion || this.isPaused) {
      // Check again shortly
      setTimeout(() => requestAnimationFrame(() => this.loop()), 500);
      return;
    }

    this.time += 0.012; // Calm speed
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.globalCompositeOperation = 'source-over';

    this.threads.forEach(thread => {
      thread.update(this.activeScene, this.time);
      thread.draw(this.ctx);
    });

    requestAnimationFrame(() => this.loop());
  }
}

/* ─── Signal Thread ─── */
class SignalThread {
  constructor(index, total, W, H) {
    this.index = index;
    this.total = total;
    this.W = W;
    this.H = H;

    this.phase = (index / total) * Math.PI * 2 + Math.random() * 0.5;
    this.speed = 0.3 + Math.random() * 0.5;
    this.baseThickness = 0.6 + Math.random() * 1.4;
    this.baseOpacity  = 0.035 + Math.random() * 0.045; // Barely visible

    this.hue = Math.round(352 + (index / total) * 28) % 360;
    this.current = this._makeState(W, H, 1, 0);
    this.target  = { ...this.current };
  }

  _makeState(W, H, scene, time) {
    const norm = this.index / this.total;
    const t = time + this.phase;

    let y0 = H * 0.4 + norm * H * 0.2;
    let y1 = y0;
    let cp1y = y0 + Math.sin(t) * 60;
    let cp2y = y0 + Math.cos(t * 0.9) * 60;
    let op = this.baseOpacity;
    let th = this.baseThickness;

    switch (scene) {
      case 1:
        y0 = H * 0.2 + norm * H * 0.6;
        y1 = H * 0.48 + Math.sin(t * 0.6) * 18;
        cp1y = y0 + Math.sin(t * 0.5) * 40;
        cp2y = y1 + Math.cos(t * 0.4) * 30;
        break;
      case 2:
        y0 = H * 0.5 + Math.sin(t * 1.8) * H * 0.28;
        y1 = H * 0.5 + Math.cos(t * 1.6) * H * 0.28;
        cp1y = H * 0.5 + Math.sin(t * 2.2 + this.index) * H * 0.35;
        cp2y = H * 0.5 + Math.cos(t * 1.9 - this.index) * H * 0.35;
        op = this.baseOpacity * 0.85;
        break;
      case 3:
        y0 = H * 0.18 + norm * H * 0.64;
        y1 = y0 + Math.sin(t * 0.7) * 8;
        cp1y = y0 + Math.sin(t * 0.5) * 20;
        cp2y = y1 + Math.cos(t * 0.6) * 20;
        th = this.baseThickness * 0.8;
        break;
      case 4:
        y0 = H * 0.15 + norm * H * 0.7;
        y1 = y0;
        cp1y = H * 0.5 + Math.sin(t * 1.2) * 30;
        cp2y = H * 0.5 + Math.cos(t * 1.2) * 30;
        op = this.baseOpacity * 1.8;
        break;
      case 5:
        y0 = H * 0.28 + norm * H * 0.44;
        y1 = y0;
        cp1y = y0 + Math.sin(t * 0.4) * 10;
        cp2y = y0 + Math.cos(t * 0.4) * 10;
        th = this.baseThickness * 0.9;
        break;
      case 6:
        y0 = H * 0.5;
        y1 = H * 0.15 + norm * H * 0.7;
        cp1y = H * 0.5 + Math.sin(t * 0.5) * 40;
        cp2y = y1 + Math.cos(t * 0.4) * 40;
        break;
      case 7:
        y0 = H * 0.3 + norm * H * 0.4 + Math.sin(t * 0.35) * 40;
        y1 = y0 + Math.cos(t * 0.4) * 35;
        cp1y = y0 + Math.sin(t * 0.45 + this.index) * 80;
        cp2y = y1 + Math.cos(t * 0.5 - this.index) * 80;
        op = this.baseOpacity * 0.6;
        th = this.baseThickness * 1.2;
        break;
      case 8:
        const gap = H * 0.65 / this.total;
        y0 = H * 0.17 + this.index * gap;
        y1 = y0;
        cp1y = y0;
        cp2y = y0;
        th = this.baseThickness + Math.sin(t * 1.5 - norm * Math.PI) * 0.8;
        break;
      case 9:
        y0 = H * 0.25 + norm * H * 0.5;
        y1 = H * 0.5 + Math.sin(t * 0.5) * 16;
        cp1y = y0;
        cp2y = y1;
        op = this.baseOpacity * 1.1;
        break;
    }

    return { y0, y1, cp1y, cp2y, op, th };
  }

  update(scene, time) {
    const newTarget = this._makeState(this.W, this.H, scene, time);
    const ease = 0.032;

    for (const k of Object.keys(newTarget)) {
      this.current[k] += (newTarget[k] - this.current[k]) * ease;
    }
  }

  draw(ctx) {
    const c = this.current;
    const W = this.W;

    ctx.beginPath();
    ctx.moveTo(-W * 0.08, c.y0);
    ctx.bezierCurveTo(W * 0.33, c.cp1y, W * 0.67, c.cp2y, W * 1.08, c.y1);

    const grad = ctx.createLinearGradient(-W * 0.08, 0, W * 1.08, 0);
    grad.addColorStop(0,    `hsla(${this.hue}, 55%, 42%, 0)`);
    grad.addColorStop(0.15, `hsla(${this.hue}, 55%, 42%, ${c.op * 0.6})`);
    grad.addColorStop(0.5,  `hsla(${this.hue}, 55%, 45%, ${c.op})`);
    grad.addColorStop(0.85, `hsla(${this.hue}, 55%, 42%, ${c.op * 0.6})`);
    grad.addColorStop(1,    `hsla(${this.hue}, 55%, 42%, 0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = c.th;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

/* ─── Boot ─── */
window.addEventListener('DOMContentLoaded', () => {
  window.azeonVisuals = new AzeonVisualDNA('museum-canvas');
});
