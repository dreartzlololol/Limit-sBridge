import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import type { PlayerState } from '../types/multiplayer';
import { soundManager } from '../utils/sound';

interface MultiplayerEndModalProps {
  isOpen: boolean;
  player1: PlayerState;
  player2: PlayerState;
  durationSec: number;
  onRematch: () => void;
  onExit: () => void;
}

export const MultiplayerEndModal: React.FC<MultiplayerEndModalProps> = ({
  isOpen,
  player1,
  player2,
  durationSec,
  onRematch,
  onExit,
}) => {
  const isWinner =
    player1.levelsSolved > player2.levelsSolved ||
    (player1.levelsSolved === player2.levelsSolved && player1.score > player2.score);
  const isDraw =
    player1.levelsSolved === player2.levelsSolved && player1.score === player2.score;

  useEffect(() => {
    if (isOpen) {
      if (isWinner) {
        soundManager.playVictory();
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
        });
      } else if (!isDraw) {
        soundManager.playError();
      }
    }
  }, [isOpen, isWinner, isDraw]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.3)] text-slate-100 p-6 md:p-8 text-center space-y-6 overflow-hidden">
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.15)_0,transparent_70%)] pointer-events-none" />

        {/* Title Header Banner */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold tracking-wider uppercase">
            <Trophy className="w-4 h-4 fill-yellow-400" />
            <span>SPEED RUN FINISHED • {durationSec} SECONDS</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold font-pixel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-300 to-pink-500">
            {isDraw ? 'IT IS A DRAW!' : isWinner ? 'VICTORY!' : 'DEFEAT!'}
          </h1>

          <p className="text-xs text-slate-300 font-medium">
            {isDraw
              ? 'Both limits engineers matched speed and accuracy level for level!'
              : isWinner
              ? `Congratulations! ${player1.name} solved ${player1.levelsSolved} levels to win the Speed Run Duel!`
              : `${player2.name} solved ${player2.levelsSolved} levels to win this match. Practice makes master!`}
          </p>
        </div>

        {/* Scoreboard Podium Box */}
        <div className="relative z-10 grid grid-cols-2 gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
          {/* Player 1 Stat */}
          <div className={`p-4 rounded-xl border text-center space-y-2 ${
            isWinner ? 'bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.2)]' : 'bg-slate-900/60 border-slate-800'
          }`}>
            {isWinner && <span className="text-xs font-pixel text-yellow-300">👑 WINNER</span>}
            <div className="text-sm font-bold text-slate-100">{player1.name}</div>
            
            <div className="flex items-center justify-center space-x-1 text-emerald-400 font-pixel font-bold text-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>{player1.levelsSolved} SOLVED</span>
            </div>

            <div className="text-2xl font-extrabold font-pixel text-cyan-400">{player1.score} PTS</div>
            <div className="text-[10px] text-slate-400 font-mono">TOTAL SCORE</div>
          </div>

          {/* Player 2 Stat */}
          <div className={`p-4 rounded-xl border text-center space-y-2 ${
            !isWinner && !isDraw ? 'bg-pink-950/40 border-pink-400/60 shadow-[0_0_20px_rgba(236,72,153,0.2)]' : 'bg-slate-900/60 border-slate-800'
          }`}>
            {!isWinner && !isDraw && <span className="text-xs font-pixel text-yellow-300">👑 WINNER</span>}
            <div className="text-sm font-bold text-slate-100">{player2.name}</div>

            <div className="flex items-center justify-center space-x-1 text-emerald-400 font-pixel font-bold text-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>{player2.levelsSolved} SOLVED</span>
            </div>

            <div className="text-2xl font-extrabold font-pixel text-pink-400">{player2.score} PTS</div>
            <div className="text-[10px] text-slate-400 font-mono">TOTAL SCORE</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onRematch();
            }}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-pixel text-xs rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REMATCH SPEED RUN</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onExit();
            }}
            className="w-full sm:w-auto py-3.5 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>EXIT LOBBY</span>
          </button>
        </div>

      </div>
    </div>
  );
};
