import React from 'react';
import { X, Star, Zap, Check, Lock } from 'lucide-react';
import { soundManager } from '../utils/sound';
import type { VehicleType } from '../types/game';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStars: number;
  unlockedVehicles: VehicleType[];
  equippedVehicle: VehicleType;
  onBuyVehicle: (type: VehicleType, cost: number) => void;
  onEquipVehicle: (type: VehicleType) => void;
}

const VEHICLES = [
  {
    type: 'car' as VehicleType,
    name: 'Pixel Cruiser',
    cost: 0,
    desc: 'The classic 8-bit arcade sports car.',
    color: '#ff0055'
  },
  {
    type: 'hoverboard' as VehicleType,
    name: 'Cyber Hoverboard',
    cost: 15,
    desc: 'Anti-gravity street surfing.',
    color: '#00f0ff'
  },
  {
    type: 'spaceship' as VehicleType,
    name: 'Aero Spaceship',
    cost: 40,
    desc: 'Warp speed limit crossing.',
    color: '#a855f7'
  },
  {
    type: 'motorcycle' as VehicleType,
    name: 'Tron Cycle',
    cost: 25,
    desc: 'Light speed 2-wheeler.',
    color: '#10b981'
  },
  {
    type: 'ufo' as VehicleType,
    name: 'Alien Saucer',
    cost: 60,
    desc: 'Out of this world tech.',
    color: '#f59e0b'
  },
  {
    type: 'time_machine' as VehicleType,
    name: 'Time Machine',
    cost: 88,
    desc: 'Reach 88mph to break the limit barrier.',
    color: '#cbd5e1'
  }
];

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  availableStars,
  unlockedVehicles,
  equippedVehicle,
  onBuyVehicle,
  onEquipVehicle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn crt-overlay">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-lg text-slate-100 tracking-wider">GARAGE</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-700 text-yellow-400 font-mono">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>{availableStars} STARS</span>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/80 transition-all duration-300 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VEHICLES.map((v) => {
              const isUnlocked = unlockedVehicles.includes(v.type);
              const isEquipped = equippedVehicle === v.type;
              const canAfford = availableStars >= v.cost;

              return (
                <div 
                  key={v.type}
                  className={`relative p-4 rounded-xl border flex flex-col h-full transition-all duration-300 ${
                    isEquipped 
                      ? 'bg-slate-800 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] scale-105 z-10' 
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Decorative Icon */}
                  <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center shadow-lg" style={{ backgroundColor: `${v.color}22`, border: `1px solid ${v.color}55` }}>
                    <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: v.color, boxShadow: `0 0 10px ${v.color}` }} />
                  </div>

                  <h4 className="font-bold text-slate-200">{v.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4 flex-grow">{v.desc}</p>

                  <div className="mt-auto">
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          if (!isEquipped) {
                            soundManager.playClick();
                            onEquipVehicle(v.type);
                          }
                        }}
                        disabled={isEquipped}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                          isEquipped
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                        }`}
                      >
                        {isEquipped ? (
                          <span className="flex items-center justify-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>EQUIPPED</span>
                          </span>
                        ) : 'EQUIP'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            soundManager.playSuccess();
                            onBuyVehicle(v.type, v.cost);
                          } else {
                            soundManager.playError();
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <Star className="w-3.5 h-3.5" />
                            <span>BUY ({v.cost})</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>NEED {v.cost} STARS</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
