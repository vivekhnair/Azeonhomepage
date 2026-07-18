/**
 * Azeon Hero Cinematic Canvas Animation
 * A clean, minimalist, and premium visual representing Azeon's core intelligence.
 * Displays a central breathing core with concentric rotating vector rings and 
 * outward ripple waves on a pure white background.
 */
(function () {
  'use strict';

  let canvas, ctx, W, H, dpr, raf;
  let startTime = performance.now();
  
  // Ripple waves emitted from the core
  const RIPPLES = [];

  function init() {
    canvas = document.getElementById('hero-cinematic-canvas');
    if (!canvas) return;

    resize();
    window.addEventListener('resize', resize);
    
    // Periodically emit a clean ripple wave from the center (heartbeat)
    setInterval(emitRipple, 3000);
    
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    if (!canvas) return;
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth  || window.innerWidth;
    H = canvas.offsetHeight || window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }

  function emitRipple() {
    RIPPLES.push({
      r: 30,
      maxR: Math.max(W, H) * 0.45,
      alpha: 0.6,
      speed: 2.2
    });
  }

  function loop(now) {
    // ── Background ──────────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const timeSec = (now - startTime) * 0.001;
    
    // Position strategically in empty screen space to avoid overlapping text
    const isMobile = W < 768;
    const coreX = isMobile ? W * 0.5 : W * 0.76;
    const coreY = isMobile ? H * 0.72 : H * 0.48;

    // ── Update and Draw Ripple Waves ─────────────────────────────
    ctx.lineWidth = 1;
    for (let i = RIPPLES.length - 1; i >= 0; i--) {
      const rip = RIPPLES[i];
      rip.r += rip.speed;
      rip.alpha = Math.max(0, 0.6 * (1 - rip.r / rip.maxR));

      if (rip.alpha <= 0 || rip.r >= rip.maxR) {
        RIPPLES.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(coreX, coreY, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 212, 170, ${rip.alpha * 0.15})`;
      ctx.stroke();
    }

    // ── 1. Central Core Glow (Breathing Aura) ─────────────────────
    const breath = Math.sin(timeSec * 1.5);
    const coreGlowRadius = 120 + breath * 20;

    const glow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreGlowRadius);
    glow.addColorStop(0, 'rgba(0, 212, 170, 0.035)');
    glow.addColorStop(0.5, 'rgba(0, 95, 210, 0.01)');
    glow.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(coreX, coreY, coreGlowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // ── 2. Outer Thin Orbiting Ring (Breathes slowly) ────────────
    const outerRingRadius = 180 + Math.cos(timeSec * 0.8) * 15;
    ctx.beginPath();
    ctx.arc(coreX, coreY, outerRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 95, 210, 0.03)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── 3. Middle Dashed Vector Ring (Rotates) ───────────────────
    const dashRingRadius = 110 + breath * 6;
    ctx.save();
    ctx.translate(coreX, coreY);
    ctx.rotate(timeSec * 0.08); // Slow steady rotation
    ctx.beginPath();
    ctx.arc(0, 0, dashRingRadius, 0, Math.PI * 2);
    ctx.setLineDash([4, 16]); // Precise tech look
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ── 4. Inner Ring with Accent Nodes ─────────────────────────
    const innerRingRadius = 65 + Math.sin(timeSec * 2.2) * 4;
    ctx.beginPath();
    ctx.arc(coreX, coreY, innerRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 212, 170, 0.06)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Orbiting nodes on the inner ring
    const numNodes = 3;
    for (let i = 0; i < numNodes; i++) {
      const angle = (timeSec * 0.3) + (i * (Math.PI * 2 / numNodes));
      const nx = coreX + Math.cos(angle) * innerRingRadius;
      const ny = coreY + Math.sin(angle) * innerRingRadius;

      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? 'rgba(255, 89, 100, 0.4)' : 'rgba(0, 212, 170, 0.4)'; // Semi-transparent nodes
      ctx.fill();
    }

    // ── 5. Core Engine Hub (Subtle Glow Center) ─────────────────
    const centerRadius = 35 + breath * 3;
    const centerGlow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, centerRadius);
    centerGlow.addColorStop(0, 'rgba(0, 212, 170, 0.25)');
    centerGlow.addColorStop(1, 'rgba(0, 95, 210, 0.25)');

    ctx.beginPath();
    ctx.arc(coreX, coreY, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerGlow;
    ctx.shadowColor = 'rgba(0, 212, 170, 0.15)';
    ctx.shadowBlur = 10;
    ctx.fill();
    
    // Reset shadow for next frame
    ctx.shadowBlur = 0;

    // Core central dot
    ctx.beginPath();
    ctx.arc(coreX, coreY, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    raf = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
