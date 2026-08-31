import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Level } from '../types/game';
import { soundManager } from '../utils/sound';

interface GraphCanvasProps {
  level: Level;
  selectedChoiceVal: number | string | null;
  isDriving: boolean;
  equippedVehicle: import('../types/game').VehicleType;
  onDriveComplete: (success: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface AmbientStar {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  brightness: number;
}

// Safe Function Evaluator to prevent NaN / Infinity / Division-by-Zero from breaking canvas coordinates!
const safeEvalFn = (fn: (x: number) => number, x: number): number => {
  try {
    const val = fn(x);
    if (!Number.isFinite(val) || Number.isNaN(val)) {
      const valPlus = fn(x + 0.01);
      const valMinus = fn(x - 0.01);
      if (Number.isFinite(valPlus)) return valPlus;
      if (Number.isFinite(valMinus)) return valMinus;
      return 0;
    }
    return val;
  } catch {
    return 0;
  }
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  level,
  selectedChoiceVal,
  isDriving,
  equippedVehicle,
  onDriveComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Base Bounds from Level
  const baseXMin = level.xMin ?? -2;
  const baseXMax = level.xMax ?? 6;

  // FIXED Y BOUNDS for a cinematic "steep" look!
  // By NOT auto-fitting the Y bounds, the parabola will naturally shoot up and exit the TOP of the screen,
  // instead of being artificially flattened and stretched to the far right side!
  const yMin = level.yMin ?? -5;
  const yMax = level.yMax ?? 22;

  let xMin = baseXMin;
  let xMax = baseXMax;

  // Car animation state
  const [carX, setCarX] = useState<number>(baseXMin + 0.5);
  const [carStatus, setCarStatus] = useState<'idle' | 'driving' | 'crashed' | 'success'>('idle');
  const particlesRef = useRef<Particle[]>([]);
  const ambientStarsRef = useRef<AmbientStar[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const wheelRotationRef = useRef<number>(0);
  const checkmarkScaleRef = useRef<number>(0);

  const isChoiceCorrect = selectedChoiceVal === level.correctChoiceValue;

  // Isotropic 1:1 Coordinate Transforms
  const toScreenX = useCallback(
    (x: number, width: number) => ((x - xMin) / (xMax - xMin)) * width,
    [xMin, xMax]
  );
  const toScreenY = useCallback(
    (y: number, height: number) => height - ((y - yMin) / (yMax - yMin)) * height,
    [yMin, yMax]
  );

  // Initialize 8-bit ambient sky stars
  useEffect(() => {
    const stars: AmbientStar[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.6,
        size: Math.random() < 0.3 ? 3 : 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        brightness: Math.random(),
      });
    }
    ambientStarsRef.current = stars;
  }, []);

  // Reset car position on level change or choice change
  useEffect(() => {
    setCarX(baseXMin + 0.5);
    setCarStatus('idle');
    checkmarkScaleRef.current = 0;
  }, [level.id, selectedChoiceVal, baseXMin]);

  // Handle Driving animation trigger
  useEffect(() => {
    if (isDriving && carStatus === 'idle') {
      setCarStatus('driving');
      setCarX(baseXMin + 0.5);
      checkmarkScaleRef.current = 0;
      soundManager.playCarEngine();
    }
  }, [isDriving, carStatus, baseXMin]);

  // Drive animation loop
  useEffect(() => {
    if (carStatus !== 'driving') return;

    let currentX = carX;
    const speed = 0.04;
    const targetA = level.targetX;

    const driveStep = () => {
      currentX += speed;
      wheelRotationRef.current += 0.25;

      // Check gap crossing at targetA
      if (Math.abs(currentX - targetA) < 0.1) {
        if (!isChoiceCorrect) {
          setCarStatus('crashed');
          soundManager.playError();
          onDriveComplete(false);
          return;
        }
      }

      // Check completion
      if (currentX >= baseXMax - 0.6) {
        setCarStatus('success');
        soundManager.playSuccess();

        if (canvasRef.current) {
          const w = canvasRef.current.width;
          const h = canvasRef.current.height;
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 8 + 3;
            particlesRef.current.push({
              x: w / 2,
              y: h / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 0,
              maxLife: 40 + Math.random() * 20,
              color: ['#00ff9d', '#fbbf24', '#38bdf8', '#ff00ea'][Math.floor(Math.random() * 4)],
              size: Math.random() * 6 + 3,
            });
          }
        }

        onDriveComplete(true);
        return;
      }

      setCarX(currentX);

      // Exhaust sparks
      const currentY = currentX < targetA ? safeEvalFn(level.evalLeft, currentX) : safeEvalFn(level.evalRight, currentX);
      if (canvasRef.current) {
        const sx = toScreenX(currentX, canvasRef.current.width);
        const sy = toScreenY(currentY, canvasRef.current.height);
        if (Number.isFinite(sx) && Number.isFinite(sy)) {
          for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
              x: sx - 22,
              y: sy - 4 + (Math.random() - 0.5) * 4,
              vx: -Math.random() * 3 - 1.5,
              vy: (Math.random() - 0.5) * 2 - 0.5,
              life: 0,
              maxLife: 15 + Math.random() * 10,
              color: Math.random() < 0.5 ? '#f59e0b' : '#ff0055',
              size: Math.random() < 0.5 ? 4 : 2,
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(driveStep);
    };

    animFrameRef.current = requestAnimationFrame(driveStep);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [carStatus, carX, level, isChoiceCorrect, baseXMax, toScreenX, toScreenY, onDriveComplete]);

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let renderAnimId: number;
    let timeTick = 0;

    const render = () => {
      timeTick += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.imageSmoothingEnabled = false;

      // 1. RETRO 8-BIT SKY BACKGROUND
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#090514');
      skyGrad.addColorStop(0.4, '#190a38');
      skyGrad.addColorStop(0.7, '#2b1055');
      skyGrad.addColorStop(1, '#5b21b6');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Twinkling Stars
      ctx.save();
      ambientStarsRef.current.forEach((star) => {
        star.brightness += star.twinkleSpeed;
        const alpha = Math.abs(Math.sin(star.brightness));
        const px = star.x * width;
        const py = star.y * height;

        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(px, py, star.size, star.size);
      });
      ctx.restore();

      // 8-Bit Pixelated Sun
      const sunX = width - 100;
      const sunY = 70;
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 35;
      
      ctx.fillStyle = '#fbbf24';
      const sunRadius = 28;
      for (let y = -sunRadius; y <= sunRadius; y += 4) {
        const rowW = Math.sqrt(sunRadius * sunRadius - y * y);
        ctx.fillRect(sunX - rowW, sunY + y, rowW * 2, 4);
      }

      ctx.fillStyle = '#2b1055';
      ctx.fillRect(sunX - 32, sunY + 4, 64, 3);
      ctx.fillRect(sunX - 32, sunY + 12, 64, 4);
      ctx.fillRect(sunX - 32, sunY + 20, 64, 5);
      ctx.restore();

      // Clouds
      const drawPixelCloud = (cx: number, cy: number) => {
        ctx.fillStyle = '#ffffff22';
        ctx.fillRect(cx, cy, 50, 16);
        ctx.fillRect(cx + 8, cy - 8, 34, 8);
        ctx.fillRect(cx + 16, cy - 16, 18, 8);
      };
      
      const cloudWrap = (x: number) => ((x % (width + 150)) + width + 150) % (width + 150) - 75;
      const cloudPhase = (carX - baseXMin) * -20;
      
      drawPixelCloud(cloudWrap(60 + Math.sin(timeTick * 0.5) * 10 + cloudPhase), 45);
      drawPixelCloud(cloudWrap(width * 0.45 + Math.cos(timeTick * 0.3) * 15 + cloudPhase * 1.5), 65);
      drawPixelCloud(cloudWrap(width * 0.72 + cloudPhase * 2.2), 35);
      drawPixelCloud(cloudWrap(width * 1.2 + cloudPhase * 1.2), 25);

      // Mountains (Parallax)
      ctx.fillStyle = '#17092c';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - 80);
      let mX = 0;
      const mountainPhase = (carX - baseXMin) * 0.8;
      while (mX <= width + 16) {
        const peakH = 60 + Math.sin((mX + mountainPhase * 10) * 0.02) * 35;
        ctx.lineTo(mX, height - peakH);
        mX += 16;
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 2. RETRO GRID LINES
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#a855f733';

      const xStep = (xMax - xMin) > 15 ? 5 : 1;
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += xStep) {
        const sx = toScreenX(x, width);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();

        if (x !== 0) {
          ctx.fillStyle = '#f0abfc';
          ctx.font = 'bold 10px "VT323", monospace';
          ctx.fillText(`${x}`, sx + 4, toScreenY(0, height) + 14);
        }
      }

      const yStep = (yMax - yMin) > 15 ? 5 : 1;
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += yStep) {
        const sy = toScreenY(y, height);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
        ctx.stroke();

        if (y !== 0) {
          ctx.fillStyle = '#f0abfc';
          ctx.font = 'bold 10px "VT323", monospace';
          ctx.fillText(`${y}`, toScreenX(0, width) + 4, sy - 4);
        }
      }

      // Main Axes
      const originX = toScreenX(0, width);
      const originY = toScreenY(0, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#c084fc66';
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      ctx.fillStyle = '#e879f9';
      ctx.font = 'bold 12px "VT323", monospace';
      ctx.fillText('X', width - 20, originY - 8);
      ctx.fillText('Y', originX + 8, 18);

      // 3. TARGET POINT LIGHT BEACON AT x = a
      const targetSx = toScreenX(level.targetX, width);
      const pulseAlpha = 0.5 + Math.sin(timeTick * 4) * 0.3;

      ctx.save();
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = `rgba(251, 191, 36, ${pulseAlpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetSx, 0);
      ctx.lineTo(targetSx, height);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText(`x → ${level.targetX}`, targetSx + 6, 26);

      // 4. SUSPENSION BRIDGE PILLARS
      const leftEndpointY = safeEvalFn(level.evalLeft, level.targetX - 0.001);
      const rightEndpointY = safeEvalFn(level.evalRight, level.targetX + 0.001);
      const leftEndpointSy = toScreenY(leftEndpointY, height);
      const rightEndpointSy = toScreenY(rightEndpointY, height);
      const bridgeDeckSy = (leftEndpointSy + rightEndpointSy) / 2;

      ctx.save();
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 2;

      const pillarH = height - (bridgeDeckSy - 70);
      ctx.fillRect(targetSx - 20, bridgeDeckSy - 70, 14, pillarH);
      ctx.strokeRect(targetSx - 20, bridgeDeckSy - 70, 14, pillarH);

      ctx.fillRect(targetSx + 6, bridgeDeckSy - 70, 14, pillarH);
      ctx.strokeRect(targetSx + 6, bridgeDeckSy - 70, 14, pillarH);

      ctx.setLineDash([]);
      ctx.strokeStyle = '#818cf8';
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetSx - 20, bridgeDeckSy - 70);
      ctx.quadraticCurveTo(targetSx - 50, bridgeDeckSy, targetSx - 90, bridgeDeckSy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(targetSx + 20, bridgeDeckSy - 70);
      ctx.quadraticCurveTo(targetSx + 50, bridgeDeckSy, targetSx + 90, bridgeDeckSy);
      ctx.stroke();
      ctx.restore();

      // 5. TRUE 2D SIDE-VIEW ROAD PLATFORM & GIRDER CROSS-SECTION
      const drawSideViewRoad = (
        evalFn: (x: number) => number,
        startDomainX: number,
        endDomainX: number,
        isLeftBranch: boolean
      ) => {
        const samples = 220;
        const dx = (endDomainX - startDomainX) / samples;

        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= samples; i++) {
          const x = startDomainX + i * dx;
          const y = safeEvalFn(evalFn, x);
          const sx = toScreenX(x, width);
          const sy = toScreenY(y, height);
          if (Number.isFinite(sx) && Number.isFinite(sy)) {
            // Smoothly draw continuous curve without artificial ceiling clamping
            points.push({ x: sx, y: sy });
          }
        }

        if (points.length < 2) return;

        const neonColor = isLeftBranch ? '#00f0ff' : '#ff00ea';
        const deckDepth = 25;
        const zOffsetX = 18;
        const zOffsetY = -24;

        ctx.save();
        
        // Layer A: Back Guardrail (drawn first, furthest back)
        ctx.shadowBlur = 0;
        const postInterval = 12;
        for (let i = 0; i < points.length; i += postInterval) {
          const pt = points[i];
          ctx.fillStyle = '#334155'; // Darker for distance
          ctx.fillRect(pt.x + zOffsetX - 1, pt.y + zOffsetY - 10, 3, 10);
        }
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(points[0].x + zOffsetX, points[0].y + zOffsetY - 8);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x + zOffsetX, points[i].y + zOffsetY - 8);
        }
        ctx.stroke();

        // Layer B: Top Asphalt Deck (The 3D Ribbon Surface)
        ctx.fillStyle = '#0f172a'; // Road color
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        for (let i = points.length - 1; i >= 0; i--) {
          ctx.lineTo(points[i].x + zOffsetX, points[i].y + zOffsetY);
        }
        ctx.closePath();
        ctx.fill();
        
        // Back edge neon
        ctx.lineWidth = 2;
        ctx.strokeStyle = isLeftBranch ? '#0891b2' : '#a21caf'; // Darker neon
        ctx.beginPath();
        ctx.moveTo(points[0].x + zOffsetX, points[0].y + zOffsetY);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x + zOffsetX, points[i].y + zOffsetY);
        }
        ctx.stroke();

        // Layer C: Front Face (Underneath the front edge)
        ctx.fillStyle = '#161226';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        for (let i = points.length - 1; i >= 0; i--) {
          ctx.lineTo(points[i].x, points[i].y + deckDepth);
        }
        ctx.closePath();
        ctx.fill();

        // Bottom Support Girder Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y + deckDepth);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y + deckDepth);
        }
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Layer D: Front Edge Neon (Bright)
        ctx.lineWidth = 5;
        ctx.strokeStyle = neonColor;
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        // Layer E: Front Guardrail
        ctx.shadowBlur = 0;
        for (let i = 0; i < points.length; i += postInterval) {
          const pt = points[i];
          ctx.fillStyle = '#64748b';
          ctx.fillRect(pt.x - 1, pt.y - 10, 3, 10);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(pt.x - 2, pt.y - 12, 5, 3);
        }

        // Front Guardrail Cable
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y - 8);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y - 8);
        }
        ctx.stroke();

        ctx.restore();
      };

      // Draw Left Side-View Road (extended to safely exit screen)
      drawSideViewRoad(level.evalLeft, xMin - 5, level.targetX - 0.001, true);

      // Draw Right Side-View Road (extended to safely exit screen)
      drawSideViewRoad(level.evalRight, level.targetX + 0.001, xMax + 5, false);

      // 6. 2D SIDE-VIEW BRIDGE DECK AT GAP x = targetX
      ctx.save();
      const showConnectedBridge = (carStatus === 'driving' || carStatus === 'success') && isChoiceCorrect;

      if (showConnectedBridge) {
        ctx.fillStyle = '#0f291e';
        ctx.fillRect(targetSx - 14, bridgeDeckSy, 28, 20);

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#00ff9d';
        ctx.shadowColor = '#00ff9d';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.moveTo(targetSx - 14, leftEndpointSy);
        ctx.lineTo(targetSx + 14, rightEndpointSy);
        ctx.stroke();

        ctx.fillStyle = '#00ff9d';
        ctx.fillRect(targetSx - 6, bridgeDeckSy - 3, 12, 10);
      } else {
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.fillStyle = '#090514';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(targetSx - 6, leftEndpointSy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ff00ea';
        ctx.shadowColor = '#ff00ea';
        ctx.beginPath();
        ctx.arc(targetSx + 6, rightEndpointSy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // 7. Sparkles & Particles
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = 1 - p.life / p.maxLife;

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.globalAlpha = 1.0;
      });

      // 8. RENDER 8-BIT SIDE-VIEW RETRO SPORTS CAR RESTING ON TOP OF ROAD SURFACE
      const cX = Math.max(baseXMin + 0.1, carX);
      const deltaX = 0.01;
      const nextX = cX + deltaX;

      const cY = cX < level.targetX ? safeEvalFn(level.evalLeft, cX) : safeEvalFn(level.evalRight, cX);
      const nextY = nextX < level.targetX ? safeEvalFn(level.evalLeft, nextX) : safeEvalFn(level.evalRight, nextX);

      let carSx = toScreenX(cX, width);
      let carSy = toScreenY(cY, height);

      let nextCarSx = toScreenX(nextX, width);
      let nextCarSy = toScreenY(nextY, height);

      // Safe coordinate fallbacks
      if (!Number.isFinite(carSx)) carSx = 50;
      if (!Number.isFinite(carSy)) carSy = height / 2;
      if (!Number.isFinite(nextCarSx)) nextCarSx = carSx + 5;
      if (!Number.isFinite(nextCarSy)) nextCarSy = carSy;

      const roadAngle = Math.atan2(nextCarSy - carSy, nextCarSx - carSx);

      ctx.save();
      ctx.translate(carSx, carSy);

      if (carStatus === 'crashed') {
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-24, -24, 48, 48);

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-14, -14, 28, 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText('BOOM!', -30, -32);
      } else {
        // Rotate car to match road slope!
        ctx.rotate(roadAngle);

        // 3D Drop Shadow on the Top Deck
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.ellipse(8, -6, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Offset upward so vehicles rest perfectly on top of the road surface line
        const hoverOffset = equippedVehicle === 'hoverboard' ? -20 : -14;
        ctx.translate(0, hoverOffset);

        if (equippedVehicle === 'car') {
          // --- DETAILED 8-BIT SIDE-VIEW ARCADE SPORTS CAR SPRITE ---
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;

          // Pixel Body Base
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(-18, -6, 36, 12);
          ctx.fillRect(18, -2, 6, 8);
          ctx.fillRect(24, 0, 4, 6);
          ctx.fillRect(-22, -12, 6, 4);
          ctx.fillRect(-20, -8, 4, 4);

          // Driver Cabin / Roof
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-8, -14, 20, 8);

          // Windshield Glass
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(2, -12, 8, 6);
          ctx.fillRect(-6, -12, 6, 6);

          // Driver Helmet
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-3, -10, 4, 4);

          // Side Racing Stripe
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(-14, -2, 34, 3);

          // 8-Bit Pixel Wheels
          const wheelRot = wheelRotationRef.current;

          const drawPixelWheel = (wx: number, wy: number) => {
            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wheelRot);

            ctx.fillStyle = '#090514';
            ctx.fillRect(-6, -6, 12, 12);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-3, -3, 6, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -4, 2, 8);
            ctx.fillRect(-4, -1, 8, 2);

            ctx.restore();
          };

          drawPixelWheel(-10, 6);
          drawPixelWheel(14, 6);

          // Headlight Beam
          ctx.save();
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 20;
          const headGrad = ctx.createLinearGradient(28, 0, 80, 0);
          headGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
          headGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.moveTo(28, -2);
          ctx.lineTo(80, -18);
          ctx.lineTo(80, 18);
          ctx.lineTo(28, 6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (equippedVehicle === 'hoverboard') {
          // --- CYBER HOVERBOARD SPRITE ---
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 15;

          // Hoverboard Deck
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-14, 6, 28, 4);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(-12, 6, 24, 2);

          // Front/Back Bumpers
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-16, 4, 4, 6);
          ctx.fillRect(12, 4, 4, 6);

          // Thruster Glow (underneath)
          const hoverPulse = Math.sin(Date.now() / 100) * 4;
          ctx.fillStyle = '#00f0ff';
          ctx.globalAlpha = 0.6;
          ctx.fillRect(-10, 10, 8, hoverPulse + 4);
          ctx.fillRect(2, 10, 8, hoverPulse + 4);
          ctx.globalAlpha = 1.0;

          // Character (Rider)
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#a855f7'; // Suit
          ctx.fillRect(-4, -8, 8, 14);
          ctx.fillStyle = '#ff00ea'; // Jacket
          ctx.fillRect(-6, -6, 12, 8);
          
          // Head / Helmet
          ctx.fillStyle = '#fbbf24'; // Visor
          ctx.fillRect(2, -14, 6, 6);
          ctx.fillStyle = '#1e1b4b'; // Helmet
          ctx.fillRect(-4, -16, 8, 8);

          // Arms / Legs
          ctx.fillStyle = '#00f0ff'; // Arm holding balance
          ctx.fillRect(6, -2, 6, 2);
          ctx.fillStyle = '#2b1055'; // Legs
          ctx.fillRect(-4, 6, 2, 4);
          ctx.fillRect(2, 6, 2, 4);
        } else if (equippedVehicle === 'spaceship') {
          // --- AERO SPACESHIP SPRITE ---
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 20;

          // Main Fuselage
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(-15, -4, 30, 8);
          ctx.fillStyle = '#312b4d';
          ctx.fillRect(-10, -6, 20, 12);
          ctx.fillStyle = '#a855f7';
          ctx.fillRect(15, -2, 10, 4);
          
          // Nose Cone
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(25, -1, 6, 2);

          // Wings
          ctx.fillStyle = '#ff00ea';
          ctx.fillRect(-8, -12, 12, 24);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(-6, -10, 8, 20);

          // Engine Thrusters (Back)
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-20, -3, 5, 6);

          // Thruster Flame
          const flamePulse = Math.sin(Date.now() / 50) * 8 + 10;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 25;
          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.moveTo(-20, -2);
          ctx.lineTo(-20 - flamePulse, 0);
          ctx.lineTo(-20, 2);
          ctx.fill();
        } else if (equippedVehicle === 'motorcycle') {
          // --- TRON LIGHT CYCLE ---
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 15;

          // Main Body
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, -2, 10, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(-10, -2, 20, 6);

          // Neon Strip
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-8, 2, 16, 2);
          ctx.fillRect(-4, -6, 8, 2);

          // Rider
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-2, -10, 6, 6); // Helmet
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(-4, -4, 8, 4); // Body

          // Wheels
          const drawTronWheel = (wx: number) => {
            ctx.save();
            ctx.translate(wx, 4);
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#022c22';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#10b981';
            ctx.stroke();
            ctx.restore();
          };
          drawTronWheel(-12);
          drawTronWheel(12);

        } else if (equippedVehicle === 'ufo') {
          // --- ALIEN SAUCER ---
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 20;

          // Glass Dome
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(0, -6, 10, Math.PI, 0);
          ctx.fill();

          // Alien inside
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-3, -10, 6, 6);
          ctx.fillStyle = '#000000';
          ctx.fillRect(-2, -8, 2, 2);
          ctx.fillRect(2, -8, 2, 2);

          // Saucer Disc
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Neon Lights
          ctx.fillStyle = '#f59e0b';
          const pulse = Math.sin(Date.now() / 150);
          if (pulse > 0) ctx.fillRect(-16, -1, 4, 2);
          if (pulse > -0.5) ctx.fillRect(-2, -1, 4, 2);
          if (pulse > 0) ctx.fillRect(12, -1, 4, 2);

          // Tractor Beam (subtle glow downward)
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.beginPath();
          ctx.moveTo(-10, 6);
          ctx.lineTo(10, 6);
          ctx.lineTo(16, 20);
          ctx.lineTo(-16, 20);
          ctx.fill();
        }
      }
      ctx.restore();

      // 9. GLOWING GREEN CHECK MARK ICON (✅) OVERLAY
      if (carStatus === 'success') {
        if (checkmarkScaleRef.current < 1) {
          checkmarkScaleRef.current += 0.05;
        }

        const scale = Math.min(1, checkmarkScaleRef.current);
        const centerX = width / 2;
        const centerY = height / 2 - 20;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        ctx.shadowColor = '#00ff9d';
        ctx.shadowBlur = 45;

        ctx.fillStyle = 'rgba(5, 46, 22, 0.85)';
        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-16, 2);
        ctx.lineTo(-4, 14);
        ctx.lineTo(18, -12);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.restore();
      }

      renderAnimId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(renderAnimId);
    };
  }, [
    level,
    selectedChoiceVal,
    carX,
    carStatus,
    isChoiceCorrect,
    baseXMin,
    baseXMax,
    xMin,
    xMax,
    yMin,
    yMax,
    toScreenX,
    toScreenY,
  ]);

  // Dynamic Canvas Resize Handler for window / fullscreen changes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative transition-all duration-300 w-full h-[380px] md:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(0,240,255,0.25)] crt-overlay"
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-xs flex items-center space-x-4 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-arcade text-sm tracking-wide">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#00f0ff] inline-block shadow-[0_0_8px_#00f0ff]" />
          <span>ROAD LEFT f(x⁻)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#ff00ea] inline-block shadow-[0_0_8px_#ff00ea]" />
          <span>ROAD RIGHT f(x⁺)</span>
        </div>
      </div>
    </div>
  );
};
