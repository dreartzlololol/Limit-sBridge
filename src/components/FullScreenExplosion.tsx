import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export const FullScreenExplosion: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwaveRadiusRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Generate 160 full-screen flying 8-bit debris particles
    const particles: Particle[] = [];
    const colors = ['#ef4444', '#f59e0b', '#fbbf24', '#dc2626', '#ffffff', '#7c3aed', '#00f0ff', '#ff00ea'];

    for (let i = 0; i < 160; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 26 + 6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: Math.random() * 16 + 8, // chunky 8-bit debris blocks
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: 65 + Math.random() * 30,
      });
    }

    particlesRef.current = particles;
    shockwaveRadiusRef.current = 10;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // 1. EXPANDING FIREBALL SHOCKWAVE CIRCLE
      shockwaveRadiusRef.current += 28;
      const r = shockwaveRadiusRef.current;
      if (r < w * 1.2) {
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 40;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Fireball Ring
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0, r - 20), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 2. FLYING 8-BIT DEBRIS BLOCKS
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity acceleration
        p.rotation += p.vRot;
        p.life++;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden animate-fadeIn">
      {/* Explosive Red/Orange Screen Flash */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-600/50 via-amber-600/40 to-red-600/50 backdrop-hue-rotate-90 animate-pulse" />

      {/* Shattered Glass SVG Cracks Covering Entire Screen */}
      <svg className="absolute inset-0 w-full h-full stroke-amber-300 stroke-[4] fill-none drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]">
        <line x1="50%" y1="50%" x2="5%" y2="5%" />
        <line x1="50%" y1="50%" x2="95%" y2="8%" />
        <line x1="50%" y1="50%" x2="98%" y2="92%" />
        <line x1="50%" y1="50%" x2="2%" y2="95%" />
        <line x1="50%" y1="50%" x2="48%" y2="1%" />
        <line x1="50%" y1="50%" x2="52%" y2="99%" />
        <line x1="50%" y1="50%" x2="1%" y2="48%" />
        <line x1="50%" y1="50%" x2="99%" y2="52%" />

        {/* Shatter Spiderweb Lines */}
        <polygon points="25%,15% 75%,10% 90%,45% 80%,85% 20%,90% 8%,40%" strokeDasharray="8,8" />
        <polygon points="35%,25% 65%,22% 75%,48% 68%,72% 32%,75% 22%,48%" strokeDasharray="5,5" />
      </svg>

      {/* 2D Canvas for Expanding Fireball & Flying Debris */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
