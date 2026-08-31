import React from 'react';
import { Zap, Shield, Flame, Clock, AlertTriangle } from 'lucide-react';
import type { PlayerState, PowerUpType } from '../types/multiplayer';
import { POWER_UPS } from '../types/multiplayer';
import { soundManager } from '../utils/sound';

interface MultiplayerHUDProps {
  player1: PlayerState;
  player2: PlayerState;
  currentRound: number;
  totalRounds: number;
  timeLeftSec: number;
  onCastPowerUp: (powerUp: PowerUpType) => void;
  activeFog: boolean;
  activeGlitch: boolean;
  activeShield: boolean;
}

export const MultiplayerHUD: React.FC<MultiplayerHUDProps> = ({
  player1,
  player2,
  currentRound,
  totalRounds,
  timeLeftSec,
  onCastPowerUp,
  activeFog,
  activeGlitch,
  activeShield,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 px-4 pt-2">
      {/* Top Match Bar */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* PLAYER 1 CARD */}
        <div className="flex items-center space-x-3 flex-1 w-full justify-between md:justify-start bg-slate-950/60 p-2.5 rounded-xl border border-cyan-500/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-pixel text-xs font-bold shadow-md">
              P1
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                <span>{player1.name}</span>
                {player1.streak > 1 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-400/40 text-[9px] font-mono rounded flex items-center">
                    <Flame className="w-3 h-3 mr-0.5 fill-amber-400" />
                    {player1.streak}x
                  </span>
                )}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono capitalize">
                Vehicle: {player1.vehicle} {player1.hasAnswered && (player1.isCorrect ? '✅ Answered' : '❌ Failed')}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold font-pixel text-cyan-400">{player1.score}</div>
            <div className="text-[9px] text-slate-400 font-mono">PTS</div>
          </div>
        </div>

        {/* CENTER MATCH STATUS (ROUND & TIMER) */}
        <div className="flex items-center space-x-4 px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-mono">ROUND</div>
            <div className="text-sm font-bold font-pixel text-yellow-400">
              {currentRound} / {totalRounds}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="text-center">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>TIME</span>
            </div>
            <div className={`text-sm font-bold font-pixel ${timeLeftSec <= 5 ? 'text-rose-400 animate-ping' : 'text-slate-100'}`}>
              {timeLeftSec}s
            </div>
          </div>
        </div>

        {/* PLAYER 2 CARD */}
        <div className="flex items-center space-x-3 flex-1 w-full justify-between md:justify-end bg-slate-950/60 p-2.5 rounded-xl border border-pink-500/30">
          <div className="text-left md:text-right order-2 md:order-1">
            <div className="text-xl font-extrabold font-pixel text-pink-400">{player2.score}</div>
            <div className="text-[9px] text-slate-400 font-mono">PTS</div>
          </div>

          <div className="flex items-center space-x-2.5 order-1 md:order-2">
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5 md:justify-end">
                {player2.streak > 1 && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-400/40 text-[9px] font-mono rounded flex items-center">
                    <Flame className="w-3 h-3 mr-0.5 fill-amber-400" />
                    {player2.streak}x
                  </span>
                )}
                <span>{player2.name}</span>
              </div>
              <div className="text-[10px] text-pink-400 font-mono capitalize md:text-right">
                Vehicle: {player2.vehicle} {player2.hasAnswered && (player2.isCorrect ? '✅ Answered' : '❌ Failed')}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-pixel text-xs font-bold shadow-md">
              P2
            </div>
          </div>
        </div>

      </div>

      {/* POWER-UP ACTION BAR & ENERGY METER */}
      <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Energy Meter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1 text-xs font-bold font-mono text-yellow-400">
            <Zap className="w-4 h-4 fill-yellow-400 animate-pulse" />
            <span>ENERGY</span>
          </div>
          <div className="w-36 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              style={{ width: `${Math.min(100, player1.energy)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">{Math.floor(player1.energy)}%</span>
        </div>

        {/* Power-Up Skill Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
          {(['fog', 'glitch', 'timeRush', 'shield'] as PowerUpType[]).map((type) => {
            const info = POWER_UPS[type];
            const canAfford = player1.energy >= info.cost;

            return (
              <button
                key={type}
                onClick={() => {
                  if (canAfford) {
                    soundManager.playPowerUp();
                    onCastPowerUp(type);
                  }
                }}
                disabled={!canAfford}
                title={`${info.name}: ${info.description} (${info.cost} Energy)`}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 ${
                  canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 border-cyan-400/60 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-125'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <span>{info.icon}</span>
                <span className="hidden lg:inline">{info.name}</span>
                <span className="text-[9px] font-mono text-yellow-300">({info.cost})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Active Attack Status Alert Badges */}
      <div className="flex items-center justify-center space-x-3">
        {activeFog && (
          <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-300 text-xs font-mono font-bold animate-pulse flex items-center space-x-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>💨 FOG ATTACK ACTIVE! GRAPH BLURRED</span>
          </div>
        )}

        {activeGlitch && (
          <div className="px-3 py-1 bg-rose-500/20 border border-rose-400/50 rounded-full text-rose-300 text-xs font-mono font-bold animate-bounce flex items-center space-x-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚡ GLITCH ATTACK ACTIVE! CONTROLS DISTORTED</span>
          </div>
        )}

        {activeShield && (
          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>🛡️ SHIELD BARRIER ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
};
