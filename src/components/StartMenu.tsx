import React from 'react';
import { Play, Grid, Trophy, Star, Volume2, VolumeX, Zap, Award, Swords } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface StartMenuProps {
  totalStars: number;
  completedCount: number;
  totalLevels: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenGarage: () => void;
  onOpenMultiplayer: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  totalStars,
  completedCount,
  totalLevels,
  isMuted,
  onToggleMute,
  onStartGame,
  onOpenLevelSelect,
  onOpenGarage,
  onOpenMultiplayer,
}) => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-hidden crt-overlay selection:bg-cyan-500 selection:text-white">
      {/* Animated Synthwave Grid Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.15)_0,transparent_70%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-6xl w-full mx-auto">
        <div className="flex items-center space-x-2 text-yellow-400 font-pixel text-xs">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>ARCADE EDITION</span>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMute();
          }}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-500 text-slate-200 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 active:scale-95 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </header>

      {/* Main Title Hero Banner */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 text-center space-y-8 my-auto">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Zap className="w-4 h-4 fill-cyan-400" />
            <span>CALCULUS LIMIT PUZZLE • 100 STAGES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider font-pixel text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 drop-shadow-[0_0_25px_rgba(0,240,255,0.6)] animate-pulseGlow">
            LIMIT'S BRIDGE
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
            เกมวิศวกรเชื่อมสะพานคณิตศาสตร์ เรื่อง <strong className="text-cyan-400">ลิมิตของฟังก์ชัน</strong> 100 ด่าน
            <br />
            พิชิตโจทย์ปรนัย ทดสอบขับรถพิกเซลสไตล์ 8-Bit Arcade!
          </p>
        </div>

        {/* Player Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="text-yellow-400 text-sm font-bold flex items-center justify-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>{totalStars}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">TOTAL STARS</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="text-cyan-400 text-sm font-bold flex items-center justify-center space-x-1">
              <Award className="w-4 h-4" />
              <span>{completedCount} / {totalLevels}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">COMPLETED</div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="text-purple-400 text-sm font-bold font-mono">
              {completedCount === 100 ? 'MASTER 👑' : completedCount > 50 ? 'EXPERT ⭐' : 'PRO 🎮'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">RANK</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto pt-2">
          <button
            onClick={() => {
              soundManager.playSuccess();
              onStartGame();
            }}
            className="btn-uiverse w-full sm:w-auto flex-1 font-pixel text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] group"
          >
            <Play className="w-5 h-5 fill-white transition-transform group-hover:scale-110" />
            <span>PRESS START</span>
          </button>

          <button
            onClick={() => {
              soundManager.playSuccess();
              onOpenMultiplayer();
            }}
            className="btn-uiverse w-full sm:w-auto font-pixel text-xs shadow-[0_0_25px_rgba(236,72,153,0.5)] border-pink-500/60 bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800 hover:to-pink-800"
          >
            <Swords className="w-4 h-4 text-pink-400 animate-pulse" />
            <span>VS MULTIPLAYER</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLevelSelect();
            }}
            className="btn-uiverse w-full sm:w-auto font-pixel text-xs shadow-lg"
          >
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>LEVELS</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenGarage();
            }}
            className="btn-uiverse w-full sm:w-auto font-pixel text-xs shadow-lg"
          >
            <Zap className="w-4 h-4 text-pink-400" />
            <span>GARAGE</span>
          </button>
        </div>
      </main>

      {/* Footer copyright / info */}
      <footer className="relative z-10 p-6 text-center text-xs text-slate-500 font-mono">
        LIMIT'S BRIDGE • GRADE 12 CALCULUS GAME • 100 LEVELS
      </footer>
    </div>
  );
};
