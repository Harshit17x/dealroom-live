import React, { useEffect, useRef } from 'react';

/**
 * Parses any 3 or 6-digit hex string into [r, g, b] numbers.
 */
function parseHexToRgb(hex) {
  if (!hex) return [255, 121, 97]; // Default DealRoom Coral #ff7961
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 255,
      parseInt(clean[1] + clean[1], 16) || 121,
      parseInt(clean[2] + clean[2], 16) || 97
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 255,
    parseInt(clean.slice(2, 4), 16) || 121,
    parseInt(clean.slice(4, 6), 16) || 97
  ];
}

/**
 * Interactive Grid Canvas with:
 * 1. Compact mouse spotlight that smoothly fades out when the cursor is stationary.
 * 2. Click ripple wave that flows from the click location outward across the grid
 *    (lighting up grid lines along the expanding wave crest, not all at once).
 */
export default function GraphPaperCanvas({
  theme = 'light',
  color = '#ff7961' // One single accent color
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Mouse coordinates with smooth damping
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isActive: false
    };

    // Tracking movement to fade out when mouse is idle/stable
    let lastMoveTime = 0;
    let mouseIntensity = 0;
    const IDLE_TIMEOUT_MS = 380; // Fades out smoothly when mouse stops moving

    // Outward propagating click waves
    const clickWaves = [];

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e) => {
      const dx = Math.abs(e.clientX - mouse.targetX);
      const dy = Math.abs(e.clientY - mouse.targetY);

      if (dx > 1.5 || dy > 1.5) {
        lastMoveTime = Date.now();
      }

      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
    };

    const handlePointerLeave = () => {
      mouse.isActive = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouseIntensity = 0;
    };

    // Trigger outward traveling wave on click
    const handlePointerDown = (e) => {
      const maxDistance = Math.hypot(
        Math.max(e.clientX, width - e.clientX),
        Math.max(e.clientY, height - e.clientY)
      ) + 120;

      clickWaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: maxDistance,
        speed: 21,       // Expansion speed in pixels per frame
        waveWidth: 110,  // Ring thickness of the wave crest
        life: 1.0
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown);

    // Grid size & compact spotlight settings
    const GRID_SIZE = 64;          // Spacious, clean grid cell size
    const SPOTLIGHT_RADIUS = 92;   // Reduced, subtle spotlight circle size

    // Parse single accent color
    const [cr, cg, cb] = parseHexToRgb(color);
    const spotlightRgb = `${cr}, ${cg}, ${cb}`;

    const render = () => {
      // 1. Mouse Follow & Idle Fade Calculation
      if (mouse.targetX > -500 && mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.22;
        mouse.y += (mouse.targetY - mouse.y) * 0.22;

        const isCurrentlyMoving = Date.now() - lastMoveTime < IDLE_TIMEOUT_MS;
        const targetIntensity = isCurrentlyMoving ? 1.0 : 0.0;
        mouseIntensity += (targetIntensity - mouseIntensity) * (isCurrentlyMoving ? 0.25 : 0.065);
      } else {
        mouseIntensity = 0;
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // 2. Base Canvas Background & Faint Resting Grid
      let bg = '#F9F9F9';
      let baseGridColor = 'rgba(0, 0, 0, 0.04)';

      if (theme === 'dark') {
        bg = '#000000';
        baseGridColor = 'rgba(255, 255, 255, 0.04)';
      }

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Draw base resting grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = baseGridColor;
      ctx.beginPath();
      for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
      ctx.stroke();

      // 3. Outward Propagating Click Waves (Flows from click location outward)
      if (clickWaves.length > 0) {
        for (let i = clickWaves.length - 1; i >= 0; i--) {
          const wave = clickWaves[i];
          wave.radius += wave.speed;
          wave.life = Math.max(0, 1 - wave.radius / wave.maxRadius);

          if (wave.radius > wave.maxRadius || wave.life <= 0) {
            clickWaves.splice(i, 1);
            continue;
          }

          const rInner = Math.max(0, wave.radius - wave.waveWidth);
          const rOuter = wave.radius + wave.waveWidth;

          // A. Soft translucent radial wash along the expanding wave crest
          const washGrad = ctx.createRadialGradient(wave.x, wave.y, rInner, wave.x, wave.y, rOuter);
          const washAlpha = wave.life * (theme === 'dark' ? 0.045 : 0.022);
          washGrad.addColorStop(0, `rgba(${spotlightRgb}, 0)`);
          washGrad.addColorStop(0.5, `rgba(${spotlightRgb}, ${washAlpha})`);
          washGrad.addColorStop(1, `rgba(${spotlightRgb}, 0)`);

          ctx.fillStyle = washGrad;
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, rOuter, 0, Math.PI * 2);
          ctx.fill();

          // B. Grid lines illuminated ONLY inside the traveling wave band
          const minX = Math.max(0, Math.floor((wave.x - rOuter) / GRID_SIZE) * GRID_SIZE);
          const maxX = Math.min(width, Math.ceil((wave.x + rOuter) / GRID_SIZE) * GRID_SIZE);
          const minY = Math.max(0, Math.floor((wave.y - rOuter) / GRID_SIZE) * GRID_SIZE);
          const maxY = Math.min(height, Math.ceil((wave.y + rOuter) / GRID_SIZE) * GRID_SIZE);

          const strokeGrad = ctx.createRadialGradient(wave.x, wave.y, rInner, wave.x, wave.y, rOuter);
          const peakAlpha = wave.life * (theme === 'dark' ? 0.58 : 0.50);
          strokeGrad.addColorStop(0, `rgba(${spotlightRgb}, 0)`);
          strokeGrad.addColorStop(0.35, `rgba(${spotlightRgb}, ${peakAlpha * 0.25})`);
          strokeGrad.addColorStop(0.5, `rgba(${spotlightRgb}, ${peakAlpha})`);
          strokeGrad.addColorStop(0.65, `rgba(${spotlightRgb}, ${peakAlpha * 0.25})`);
          strokeGrad.addColorStop(1, `rgba(${spotlightRgb}, 0)`);

          ctx.lineWidth = 1.25;
          ctx.strokeStyle = strokeGrad;
          ctx.beginPath();

          for (let gx = minX; gx <= maxX; gx += GRID_SIZE) {
            ctx.moveTo(gx + 0.5, minY);
            ctx.lineTo(gx + 0.5, maxY);
          }
          for (let gy = minY; gy <= maxY; gy += GRID_SIZE) {
            ctx.moveTo(minX, gy + 0.5);
            ctx.lineTo(maxX, gy + 0.5);
          }
          ctx.stroke();
        }
      }

      // 4. Mouse Hover Spotlight (Only visible while moving, fades when stable)
      if (mouseIntensity > 0.01 && mouse.x > -500) {
        const mx = mouse.x;
        const my = mouse.y;
        const r = SPOTLIGHT_RADIUS;

        // Soft, reduced radial wash
        const washGrad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        const washAlpha = (theme === 'dark' ? 0.03 : 0.012) * mouseIntensity;
        washGrad.addColorStop(0, `rgba(${spotlightRgb}, ${washAlpha})`);
        washGrad.addColorStop(0.7, `rgba(${spotlightRgb}, ${washAlpha * 0.3})`);
        washGrad.addColorStop(1, `rgba(${spotlightRgb}, 0)`);

        ctx.fillStyle = washGrad;
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fill();

        // Spotlight bounds
        const minX = Math.max(0, Math.floor((mx - r) / GRID_SIZE) * GRID_SIZE);
        const maxX = Math.min(width, Math.ceil((mx + r) / GRID_SIZE) * GRID_SIZE);
        const minY = Math.max(0, Math.floor((my - r) / GRID_SIZE) * GRID_SIZE);
        const maxY = Math.min(height, Math.ceil((my + r) / GRID_SIZE) * GRID_SIZE);

        // Vertical grid line outlines inside compact, subtle spotlight
        for (let gx = minX; gx <= maxX; gx += GRID_SIZE) {
          const distX = Math.abs(gx - mx);
          if (distX < r) {
            const spanY = Math.sqrt(r * r - distX * distX);
            const intensity = Math.pow(1 - distX / r, 1.25);
            const alpha = intensity * (theme === 'dark' ? 0.44 : 0.38) * mouseIntensity;

            ctx.lineWidth = 1.15;
            ctx.strokeStyle = `rgba(${spotlightRgb}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(gx + 0.5, Math.max(0, my - spanY));
            ctx.lineTo(gx + 0.5, Math.min(height, my + spanY));
            ctx.stroke();
          }
        }

        // Horizontal grid line outlines inside compact, subtle spotlight
        for (let gy = minY; gy <= maxY; gy += GRID_SIZE) {
          const distY = Math.abs(gy - my);
          if (distY < r) {
            const spanX = Math.sqrt(r * r - distY * distY);
            const intensity = Math.pow(1 - distY / r, 1.25);
            const alpha = intensity * (theme === 'dark' ? 0.44 : 0.38) * mouseIntensity;

            ctx.lineWidth = 1.15;
            ctx.strokeStyle = `rgba(${spotlightRgb}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(Math.max(0, mx - spanX), gy + 0.5);
            ctx.lineTo(Math.min(width, mx + spanX), gy + 0.5);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [theme, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
