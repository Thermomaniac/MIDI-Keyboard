import { useEffect, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Ripple {
  originX:   number;   // keyboard centre px
  originY:   number;
  startTime: number;   // performance.now()
  duration:  number;   // ms
  maxRadius: number;   // px
}

// ─── Constants (tuned against Figma visual) ──────────────────────────────────

const DOT_RADIUS  = 1.5;   // px  — small dots visible in Figma pattern
const DOT_SPACING = 20;    // px  — grid pitch

const DURATION    = 1800;  // ms  — full ripple lifespan
const MAX_RADIUS  = 450;   // px  — maximum ring expansion


// ─── Component ───────────────────────────────────────────────────────────────

export default function RippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let ctx: CanvasRenderingContext2D | null = null;
    let dots:    { x: number; y: number }[] = [];
    let ripples: Ripple[] = [];
    let raf:     number | null = null;

    // ── Dot grid ────────────────────────────────────────────────
    // Pre-compute once; rebuilt on resize. Grid is centred in viewport.
    function buildDots() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dots = [];
      const ox = (w % DOT_SPACING) / 2;
      const oy = (h % DOT_SPACING) / 2;
      for (let x = ox; x <= w; x += DOT_SPACING)
        for (let y = oy; y <= h; y += DOT_SPACING)
          dots.push({ x, y });
    }

    // ── Canvas resize ────────────────────────────────────────────
    // setTransform resets + re-applies DPR scale atomically (safe to call many times)
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      canvas.width        = w * dpr;
      canvas.height       = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    }

    // ── Main animation frame ──────────────────────────────────────
    function draw() {
      if (!ctx) return;

      const w   = window.innerWidth;
      const h   = window.innerHeight;
      const now = performance.now();

      ctx.clearRect(0, 0, w, h);

      // Cull expired ripples
      ripples = ripples.filter(r => (now - r.startTime) < r.duration);
      if (ripples.length === 0) { raf = null; return; }

      // ── Per-ripple derived state ────────────────────────────────
      const states = ripples.map(r => {
        const progress  = (now - r.startTime) / r.duration;          // 0 → 1
        const eased     = 1 - Math.pow(1 - progress, 3);             // cubic ease-out
        const radius    = eased * r.maxRadius;
        const ringWidth = 80 + progress * 40;                        // ring broadens over time
        // Opacity: fade in during first 30 %, fade out over remaining 70 %
        const opacity   =
          progress < 0.3
            ? progress / 0.3
            : 1 - (progress - 0.3) / 0.7;
        return { r, radius, ringWidth, opacity, progress };
      });

      // ── Ambient glow (behind dots) — circular ring shape ────────
      // Uses a two-circle radialGradient(cx,cy, innerR, cx,cy, outerR) so that:
      //   • everything inside  innerR → stop[0] = transparent
      //   • everything outside outerR → stop[last] = transparent
      //   • only the ring band (innerR→outerR) is coloured
      // This makes the glow track the dot ring exactly (same radius + ringWidth).
      // A 1.5× wider band is used so the halo sits softly behind the dot layer.
      for (const { r, radius, ringWidth, opacity } of states) {
        const halfW  = ringWidth * 1.5;                  // slightly wider than dot ring
        const innerR = Math.max(0, radius - halfW);
        const outerR = radius + halfW;
        const a      = opacity * 0.14;

        const grad = ctx.createRadialGradient(
          r.originX, r.originY, innerR,
          r.originX, r.originY, outerR,
        );
        // transparent at both edges → peak at ring centre (stop 0.5)
        grad.addColorStop(0,    'rgba(255, 119, 204, 0)');
        grad.addColorStop(0.35, `rgba(255, 119, 204, ${(a * 0.75).toFixed(3)})`);
        grad.addColorStop(0.5,  `rgba(255, 119, 204, ${(a).toFixed(3)})`);
        grad.addColorStop(0.7,  `rgba(255, 119, 204, ${(a * 0.45).toFixed(3)})`);
        grad.addColorStop(1,    'rgba(255, 119, 204, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Dots ────────────────────────────────────────────────────
      // Per-dot intensity = sum of all ripple contributions (clamped 0–1).
      // Batch-render by bucketed alpha to keep draw-call count low (~12 max).
      const BUCKETS = 12;
      const groups  = new Map<number, { x: number; y: number }[]>();

      for (const dot of dots) {
        let intensity = 0;

        for (const { r, radius, ringWidth, opacity } of states) {
          const dx    = dot.x - r.originX;
          const dy    = dot.y - r.originY;
          const dist  = Math.sqrt(dx * dx + dy * dy);
          const dRing = Math.abs(dist - radius);

          if (dRing < ringWidth / 2) {
            // Linear falloff from ring centre → ring edge, scaled by ripple opacity
            intensity += (1 - dRing / (ringWidth / 2)) * opacity;
          }
        }

        if (intensity < 0.015) continue;

        const key = Math.ceil(Math.min(intensity, 1) * BUCKETS) / BUCKETS;
        let g = groups.get(key);
        if (!g) { g = []; groups.set(key, g); }
        g.push(dot);
      }

      // One beginPath + fill per bucket → max ~12 canvas draw calls for all dots
      for (const [alpha, group] of groups) {
        ctx.fillStyle = `rgba(255, 119, 204, ${(alpha * 0.55).toFixed(3)})`;
        ctx.beginPath();
        for (const d of group) {
          // moveTo prevents stray lines between arc sub-paths
          ctx.moveTo(d.x + DOT_RADIUS, d.y);
          ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    // ── Key press → spawn a new ripple ───────────────────────────
    function onKeyPress() {
      ripples.push({
        originX:   window.innerWidth  / 2,
        originY:   window.innerHeight / 2,
        startTime: performance.now(),
        duration:  DURATION,
        maxRadius: MAX_RADIUS,
      });
      // Start the loop only if not already running
      if (raf === null) raf = requestAnimationFrame(draw);
    }

    // ── Init ──────────────────────────────────────────────────────
    resize();
    window.addEventListener('resize',         resize);
    window.addEventListener('midi-key-press', onKeyPress);

    return () => {
      window.removeEventListener('resize',         resize);
      window.removeEventListener('midi-key-press', onKeyPress);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
      }}
    />
  );
}
