import type { VehicleType } from './game';

export type MultiplayerMode = 'online_host' | 'online_join' | 'local';

export type PowerUpType = 'fog' | 'glitch' | 'timeRush' | 'shield';

export interface PowerUpInfo {
  type: PowerUpType;
  name: string;
  icon: string;
  cost: number;
  description: string;
}

export const POWER_UPS: Record<PowerUpType, PowerUpInfo> = {
  fog: {
    type: 'fog',
    name: 'Fog Spray',
    icon: '💨',
    cost: 30,
    description: 'Blurs the opponent canvas graph for 6 seconds!',
  },
  glitch: {
    type: 'glitch',
    name: 'UI Glitch',
    icon: '⚡',
    cost: 40,
    description: 'Distorts and shakes opponent choices for 5 seconds!',
  },
  timeRush: {
    type: 'timeRush',
    name: 'Time Rush',
    icon: '⏱️',
    cost: 50,
    description: 'Reduces opponent timer by 5 seconds!',
  },
  shield: {
    type: 'shield',
    name: 'Shield Barrier',
    icon: '🛡️',
    cost: 35,
    description: 'Blocks the next incoming attack from opponent!',
  },
};

export interface RoomSettings {
  roomCode: string;
  totalRounds: number;
  difficulty: 'All' | 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  timeLimitSec: number;
}

export interface ActiveEffect {
  type: PowerUpType;
  expiresAt: number;
}

export interface PlayerState {
  id: string;
  name: string;
  vehicle: VehicleType;
  score: number;
  streak: number;
  roundIndex: number;
  currentChoice: number | string | null;
  hasAnswered: boolean;
  isCorrect: boolean | null;
  driveResult: 'none' | 'success' | 'crashed';
  energy: number; // 0..100
  activeEffects: ActiveEffect[];
  isReady: boolean;
  isHost: boolean;
}

export type PacketType =
  | 'JOIN_REQUEST'
  | 'JOIN_ACCEPT'
  | 'PLAYER_READY'
  | 'GAME_START'
  | 'PLAYER_UPDATE'
  | 'CHOICE_SUBMITTED'
  | 'POWER_UP_CAST'
  | 'NEXT_ROUND'
  | 'REMATCH_REQUEST'
  | 'LEAVE_ROOM';

export interface NetworkPacket {
  type: PacketType;
  senderId: string;
  payload: any;
  timestamp: number;
}
