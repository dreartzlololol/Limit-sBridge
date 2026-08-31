import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Eraser, Edit3, Trash2, Check, Palette, Save } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isToolbarHovered, setIsToolbarHovered] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#00f0ff');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  const colors = ['#00f0ff', '#fbbf24', '#ffffff', '#ef4444', '#00ff9d', '#e879f9'];

  const drawGridBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    // Graph grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1a243a';
    const gridSize = 24;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save existing drawing before resize
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawGridBackground(ctx, canvas.width, canvas.height);
    if (tempCtx) ctx.drawImage(tempCanvas, 0, 0);
  }, [drawGridBackground]);

  // Load saved drawing on open
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();

    const savedImg = localStorage.getItem('scratchpad_canvas_img');
    if (savedImg) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedImg;
    }

    const handleWindowResize = () => resizeCanvas();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [isOpen, resizeCanvas]);

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      localStorage.setItem('scratchpad_canvas_img', canvas.toDataURL());
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.strokeStyle = '#0a0f1d';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvas();
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGridBackground(ctx, canvas.width, canvas.height);
    localStorage.removeItem('scratchpad_canvas_img');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-hidden animate-fadeIn crt-overlay">
      {/* 100% FULL-SCREEN GRAPH PAPER CANVAS */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* FLOATING SIDE TOOLBAR (COLLAPSIBLE / HOVER EXPANDABLE) */}
      <div
        onMouseEnter={() => setIsToolbarHovered(true)}
        onMouseLeave={() => setIsToolbarHovered(false)}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out flex flex-col items-center border rounded-2xl backdrop-blur-md shadow-2xl ${
          isToolbarHovered
            ? 'p-4 bg-slate-900/95 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.3)] scale-100 opacity-100 space-y-4'
            : 'p-2.5 bg-slate-950/70 border-cyan-500/30 scale-90 opacity-60 space-y-3'
        }`}
      >
        {/* Header Indicator */}
        <div className="flex items-center space-x-2 text-cyan-400">
          <Edit3 className="w-5 h-5 text-cyan-400 animate-pulse" />
          {isToolbarHovered && (
            <span className="font-pixel text-[10px] text-slate-100 tracking-wider">TOOLS</span>
          )}
        </div>

        {/* Color Palette (Vertical Dots) */}
        <div className={`flex flex-col items-center ${isToolbarHovered ? 'space-y-2.5' : 'space-y-1.5'}`}>
          {isToolbarHovered && (
            <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
              <Palette className="w-3 h-3" />
              <span>COLOR</span>
            </div>
          )}
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                soundManager.playClick();
                setColor(c);
                setIsEraser(false);
              }}
              className={`rounded-full transition transform hover:scale-125 flex items-center justify-center ${
                isToolbarHovered ? 'w-7 h-7' : 'w-5 h-5'
              } ${color === c && !isEraser ? 'ring-2 ring-white scale-110' : ''}`}
              style={{ backgroundColor: c }}
            >
              {color === c && !isEraser && <Check className="w-3 h-3 text-slate-950 font-bold" />}
            </button>
          ))}
        </div>

        {/* Brush Size Picker (Visible when Hovered) */}
        {isToolbarHovered && (
          <div className="flex flex-col items-center space-y-2 pt-2 border-t border-slate-800 w-full px-2">
            <span className="text-[10px] text-slate-400 font-mono">BRUSH SIZE: {lineWidth}</span>
            <input 
              type="range"
              min="1"
              max="20"
              step="1"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        )}

          {/* Eraser Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsEraser(!isEraser);
            }}
            title="ลบ (Eraser)"
            className={`p-2 rounded-xl border transition-all duration-300 active:scale-90 flex items-center justify-center shadow-lg backdrop-blur-sm ${
              isEraser
                ? 'bg-rose-500/30 text-rose-200 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-110'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/50 hover:bg-slate-700/80 hover:border-rose-500/50 hover:text-rose-300'
            }`}
          >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Clear All Button */}
          <button
            onClick={handleClear}
            title="ลบกระดานทั้งหมด (Clear All)"
            className="p-2 bg-slate-800/80 hover:bg-rose-900/50 text-rose-400 rounded-xl border border-slate-700/50 hover:border-rose-500/50 transition-all duration-300 active:scale-90 shadow-lg backdrop-blur-sm"
          >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Save & Close Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              saveCanvas();
              onClose();
            }}
            title="บันทึกและปิด (Save & Close)"
            className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl border-t border-white/20 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all duration-300 transform hover:-translate-y-1 active:scale-90"
          >
          {isToolbarHovered ? <Save className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
