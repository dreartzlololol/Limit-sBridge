import React from 'react';
import type { Level, LevelProgress } from '../types/game';
import { Star, Lock, Play, Award } from 'lucide-react';

interface LevelSelectorProps {
  levels: Level[];
  progress: Record<number, LevelProgress>;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  progress,
  currentLevelId,
  onSelectLevel,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getDifficultyBadge = (diff: Level['difficulty']) => {
    switch (diff) {
      case 'Basic':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Intermediate':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'Advanced':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Expert':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center space-x-3 text-cyan-400">
            <Award className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-slate-100">เลือกด่านพัซเซิล (Select Stage)</h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm font-medium rounded-xl border border-slate-700/50 hover:border-slate-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-95 backdrop-blur-sm"
          >
            ปิด (Close)
          </button>
        </div>

        {/* Level Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {levels.map((lvl) => {
            const prog = progress[lvl.id] || { unlocked: lvl.id === 1, completed: false, stars: 0 };
            const isUnlocked = prog.unlocked;
            const isCurrent = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.id);
                    onClose();
                  }
                }}
                className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-br from-cyan-950/80 to-blue-900/60 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-default'
                    : isUnlocked
                    ? 'bg-slate-800/60 border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:-translate-y-1 active:scale-95 cursor-pointer backdrop-blur-sm'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getDifficultyBadge(
                        lvl.difficulty
                      )}`}
                    >
                      {lvl.difficulty}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (prog.stars || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mb-1">{lvl.titleTh}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{lvl.subtitle}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">{lvl.targetXText}</span>

                  {isUnlocked ? (
                    <div className="flex items-center space-x-1 text-cyan-400 font-semibold group">
                      <span>เล่นด่านนี้</span>
                      <Play className="w-3.5 h-3.5 fill-cyan-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>ยังไม่ปลดล็อก</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
