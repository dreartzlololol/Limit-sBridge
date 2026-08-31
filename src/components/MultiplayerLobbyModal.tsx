import React, { useState } from 'react';
import {
  Swords,
  Users,
  Copy,
  Check,
  Play,
  X,
  Zap,
  Sparkles,
  Car,
  Award,
} from 'lucide-react';
import type { VehicleType } from '../types/game';
import type { RoomSettings, PlayerState } from '../types/multiplayer';
import { soundManager } from '../utils/sound';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedVehicles: VehicleType[];
  equippedVehicle: VehicleType;
  onCreateRoom: (settings: RoomSettings, playerName: string, vehicle: VehicleType) => void;
  onJoinRoom: (roomCode: string, playerName: string, vehicle: VehicleType) => void;
  onStartLocalGame: (playerName: string, vehicle: VehicleType, totalRounds: number) => void;
  isConnecting: boolean;
  connectedOpponent: PlayerState | null;
  roomCode: string;
  isHost: boolean;
  onStartOnlineMatch: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  onClose,
  unlockedVehicles,
  equippedVehicle,
  onCreateRoom,
  onJoinRoom,
  onStartLocalGame,
  isConnecting,
  connectedOpponent,
  roomCode,
  isHost,
  onStartOnlineMatch,
}) => {
  const [tab, setTab] = useState<'create' | 'join' | 'local'>('create');
  const [playerName, setPlayerName] = useState<string>('Racer ' + Math.floor(Math.random() * 100));
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(equippedVehicle);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Settings for Create Room
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [timeLimitSec, setTimeLimitSec] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<RoomSettings['difficulty']>('All');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = () => {
    soundManager.playClick();
    const settings: RoomSettings = {
      roomCode: '', // will be auto-generated in service
      totalRounds,
      difficulty,
      timeLimitSec,
    };
    onCreateRoom(settings, playerName, selectedVehicle);
  };

  const handleJoin = () => {
    if (!joinCodeInput.trim()) return;
    soundManager.playClick();
    onJoinRoom(joinCodeInput.trim().toUpperCase(), playerName, selectedVehicle);
  };

  const handleLocal = () => {
    soundManager.playClick();
    onStartLocalGame(playerName, selectedVehicle, totalRounds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] text-slate-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-xl">
              <Swords className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-pixel text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300">
                LIMIT DUEL • MULTIPLAYER
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                REAL-TIME CALCULUS RACE & SABOTAGE BATTLE
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-rose-500/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Mode Selector Tabs */}
          {!roomCode && (
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setTab('create');
                }}
                className={`py-2.5 text-xs font-bold font-pixel rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  tab === 'create'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>CREATE ROOM</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setTab('join');
                }}
                className={`py-2.5 text-xs font-bold font-pixel rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  tab === 'join'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>JOIN ROOM</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setTab('local');
                }}
                className={`py-2.5 text-xs font-bold font-pixel rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  tab === 'local'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>LOCAL 1v1</span>
              </button>
            </div>
          )}

          {/* Active Room Code Banner (When Room is Created / Active) */}
          {roomCode && (
            <div className="p-4 bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border-2 border-cyan-400/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                  ROOM CODE
                </div>
                <div className="text-3xl font-extrabold font-pixel text-yellow-300 tracking-widest">
                  {roomCode}
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Player Customization (Name & Vehicle) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                PLAYER NAME
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={16}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Enter nickname..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                CHOOSE VEHICLE
              </label>
              <div className="flex items-center space-x-2">
                {unlockedVehicles.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedVehicle(v);
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center flex-1 capitalize text-xs font-bold ${
                      selectedVehicle === v
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Car className="w-4 h-4 mr-1.5" />
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TAB 1: CREATE ROOM OPTIONS */}
          {!roomCode && tab === 'create' && (
            <div className="space-y-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div className="text-xs font-mono text-slate-400 font-semibold uppercase">
                MATCH CONFIGURATION
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">TOTAL ROUNDS</label>
                  <select
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold focus:border-cyan-400"
                  >
                    <option value={3}>3 Rounds (Quick Duel)</option>
                    <option value={5}>5 Rounds (Standard)</option>
                    <option value={10}>10 Rounds (Marathon)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">TIMER PER ROUND</label>
                  <select
                    value={timeLimitSec}
                    onChange={(e) => setTimeLimitSec(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold focus:border-cyan-400"
                  >
                    <option value={15}>15 Seconds (Blitz)</option>
                    <option value={30}>30 Seconds (Normal)</option>
                    <option value={60}>60 Seconds (Relaxed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">DIFFICULTY</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold focus:border-cyan-400"
                  >
                    <option value="All">All Levels Mixed</option>
                    <option value="Basic">Basic Only</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={isConnecting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-pixel text-xs rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>CREATE ROOM & GET CODE</span>
              </button>
            </div>
          )}

          {/* TAB 2: JOIN ROOM INPUT */}
          {!roomCode && tab === 'join' && (
            <div className="space-y-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div className="space-y-2">
                <label className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  ENTER ROOM CODE (4 DIGITS)
                </label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="e.g. 4892"
                  className="w-full text-center tracking-widest text-2xl font-pixel uppercase py-3 bg-slate-950 border-2 border-purple-500/50 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={!joinCodeInput.trim() || isConnecting}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 font-pixel text-xs rounded-xl shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>CONNECT TO ROOM</span>
              </button>
            </div>
          )}

          {/* TAB 3: LOCAL 1v1 BATTLE */}
          {!roomCode && tab === 'local' && (
            <div className="space-y-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed">
                Battle locally on the same device! Players take turns or race concurrently to answer calculus limits.
              </p>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">TOTAL ROUNDS</label>
                <select
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold focus:border-yellow-400"
                >
                  <option value={3}>3 Rounds (Quick Match)</option>
                  <option value={5}>5 Rounds (Best of 5)</option>
                  <option value={10}>10 Rounds (Championship)</option>
                </select>
              </div>

              <button
                onClick={handleLocal}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-pixel text-xs rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START LOCAL 1v1 DUEL</span>
              </button>
            </div>
          )}

          {/* ROOM STATUS & OPPONENT CONNECTED STATUS */}
          {roomCode && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="text-xs font-mono text-slate-400 font-semibold uppercase flex items-center justify-between">
                <span>OPPONENT STATUS</span>
                <span className="flex items-center space-x-1.5 text-emerald-400 text-[10px]">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span>ONLINE</span>
                </span>
              </div>

              {connectedOpponent ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 font-bold text-xs uppercase">
                      P2
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{connectedOpponent.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">Vehicle: {connectedOpponent.vehicle}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-[10px] font-bold rounded-md">
                    READY
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
                  <div className="inline-block p-2 bg-purple-500/20 rounded-full animate-spin">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Waiting for opponent to join using code <strong className="text-yellow-300 font-pixel">{roomCode}</strong>...
                  </p>
                </div>
              )}

              {/* HOST START MATCH BUTTON */}
              {isHost && (
                <button
                  onClick={() => {
                    soundManager.playSuccess();
                    onStartOnlineMatch();
                  }}
                  disabled={!connectedOpponent}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 font-pixel text-xs rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START MULTIPLAYER MATCH!</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
