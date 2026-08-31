import React from 'react';
import { Volume2, VolumeX, Grid, Lightbulb, BookOpen, RotateCcw, Home, Edit3 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface GameHUDProps {
  currentLevelId: number;
  totalLevels: number;
  totalStars: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLevelSelector: () => void;
  onOpenExplanation: () => void;
  onOpenScratchpad: () => void;
  onShowHint: () => void;
  onReset: () => void;
  onGoHome: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentLevelId,
  totalLevels,
  totalStars,
  isMuted,
  onToggleMute,
  onOpenLevelSelector,
  onOpenExplanation,
  onOpenScratchpad,
  onShowHint,
  onReset,
  onGoHome,
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
      {/* Title & Stage Badge */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onGoHome();
          }}
          title="หน้าหลัก (Start Menu)"
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transition transform hover:scale-105"
        >
          <Home className="w-5 h-5 fill-white" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-pixel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            LIMIT BRIDGE BUILDER
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">วิศวกรเชื่อมสะพานลิมิต 100 ด่าน</p>
        </div>

        <div className="hidden sm:flex items-center ml-4 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/60 text-xs font-semibold text-cyan-400">
          <span>Stage {currentLevelId} / {totalLevels}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Stars Display */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs font-bold font-mono">
          <span>⭐ {totalStars}</span>
        </div>

        {/* Scratchpad (กระดาษทด) Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenScratchpad();
          }}
          title="กระดาษทดเลข (Scratchpad)"
          className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl border border-cyan-500/40 text-xs font-bold transition flex items-center space-x-1.5 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
        >
          <Edit3 className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">กระดาษทด</span>
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            soundManager.playClick();
            onReset();
          }}
          title="รีเซ็ตคำตอบ (Reset)"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Hint */}
        <button
          onClick={() => {
            soundManager.playClick();
            onShowHint();
          }}
          title="คำใบ้ (Hint)"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl border border-slate-700 transition"
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        {/* Explanation */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenExplanation();
          }}
          title="เฉลยและวิธีคิด (Solution)"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl border border-slate-700 transition"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Level Select */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenLevelSelector();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/30 transition"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">เลือกด่าน</span>
        </button>

        {/* Mute toggle */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
