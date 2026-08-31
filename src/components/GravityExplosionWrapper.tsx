import React, { useEffect, useState, useRef } from 'react';

interface GravityExplosionWrapperProps {
  isExploding: boolean;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GravityExplosionWrapper: React.FC<GravityExplosionWrapperProps> = ({
  isExploding,
  children,
  className = '',
  delay = 0,
}) => {
  const [physicsState, setPhysicsState] = useState<{
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }>({ x: 0, y: 0, rotation: 0, scale: 1 });

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isExploding) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setPhysicsState({ x: 0, y: 0, rotation: 0, scale: 1 });
      return;
    }

    let currentX = 0;
    let currentY = 0;
    let currentRotation = 0;
    let currentScale = 1;

    let vx = (Math.random() - 0.5) * 18;
    let vy = -(Math.random() * 14 + 10);
    const gravity = 1.1;
    let vRot = (Math.random() - 0.5) * 16;
    const vScale = -0.015;

    let startTimer: ReturnType<typeof setTimeout>;

    const runPhysics = () => {
      currentX += vx;
      currentY += vy;
      vy += gravity;
      currentRotation += vRot;
      currentScale = Math.max(0.2, currentScale + vScale);

      setPhysicsState({
        x: currentX,
        y: currentY,
        rotation: currentRotation,
        scale: currentScale,
      });

      animRef.current = requestAnimationFrame(runPhysics);
    };

    startTimer = setTimeout(() => {
      animRef.current = requestAnimationFrame(runPhysics);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isExploding, delay]);

  const style: React.CSSProperties = isExploding
    ? {
        transform: `translate3d(${physicsState.x}px, ${physicsState.y}px, 0px) rotate(${physicsState.rotation}deg) scale(${physicsState.scale})`,
        transition: 'none',
        zIndex: 40,
        pointerEvents: 'none',
      }
    : {};

  return <div className={`${className} ${isExploding ? 'will-change-transform' : ''}`} style={style}>{children}</div>;
};
