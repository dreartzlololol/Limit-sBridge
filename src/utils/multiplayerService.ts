import Peer from 'peerjs';
import type { NetworkPacket, PacketType } from '../types/multiplayer';

export type PacketCallback = (packet: NetworkPacket) => void;

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

class MultiplayerService {
  private peer: Peer | null = null;
  private connection: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private packetListeners: Set<PacketCallback> = new Set();
  private localPlayerId: string = '';
  private currentRoomCode: string = '';
  private isConnected: boolean = false;
  private heartbeatInterval: any = null;

  constructor() {
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
  }

  public getPlayerId(): string {
    return this.localPlayerId;
  }

  public getRoomCode(): string {
    return this.currentRoomCode;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public generateRoomCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  public async createRoom(roomCode: string): Promise<boolean> {
    this.currentRoomCode = roomCode;
    this.initBroadcastChannel(roomCode);

    return new Promise((resolve) => {
      const peerId = `limitbridge-room-${roomCode.toLowerCase()}`;
      
      try {
        if (this.peer) this.peer.destroy();
        this.peer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: ICE_SERVERS,
          },
        });

        this.peer.on('open', () => {
          console.log(`[Multiplayer] Peer Host open with ID: ${peerId}`);
          this.isConnected = true;
          resolve(true);
        });

        this.peer.on('connection', (conn: any) => {
          console.log(`[Multiplayer] Incoming connection from guest: ${conn.peer}`);
          this.connection = conn;
          this.setupConnectionListeners(conn);
        });

        this.peer.on('error', (err: any) => {
          console.warn(`[Multiplayer] Peer Host error:`, err);
          // Resolve true anyway so BroadcastChannel handles local multi-tab!
          resolve(true);
        });
      } catch (e) {
        console.warn(`[Multiplayer] Peer init error:`, e);
        resolve(true);
      }
    });
  }

  public async joinRoom(roomCode: string): Promise<boolean> {
    this.currentRoomCode = roomCode;
    this.initBroadcastChannel(roomCode);

    return new Promise((resolve) => {
      const targetPeerId = `limitbridge-room-${roomCode.toLowerCase()}`;
      
      try {
        if (this.peer) this.peer.destroy();
        this.peer = new Peer({
          debug: 1,
          config: {
            iceServers: ICE_SERVERS,
          },
        });

        this.peer.on('open', () => {
          console.log(`[Multiplayer] Client Peer open, connecting to Host: ${targetPeerId}`);
          if (!this.peer) return;

          const conn = this.peer.connect(targetPeerId, { reliable: true });
          this.connection = conn;

          conn.on('open', () => {
            console.log(`[Multiplayer] WebRTC connected to Host!`);
            this.isConnected = true;
            this.setupConnectionListeners(conn);
            resolve(true);
          });

          conn.on('error', (err: any) => {
            console.warn(`[Multiplayer] Connection error:`, err);
            resolve(true);
          });

          setTimeout(() => {
            resolve(true);
          }, 2000);
        });

        this.peer.on('error', (err: any) => {
          console.warn(`[Multiplayer] Peer client error:`, err);
          resolve(true);
        });
      } catch (e) {
        console.warn(`[Multiplayer] Peer join error:`, e);
        resolve(true);
      }
    });
  }

  private initBroadcastChannel(roomCode: string) {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    try {
      this.broadcastChannel = new BroadcastChannel(`limit_bridge_room_${roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        const packet = event.data as NetworkPacket;
        if (packet && packet.senderId !== this.localPlayerId) {
          this.notifyListeners(packet);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  private setupConnectionListeners(conn: any) {
    conn.on('data', (data: any) => {
      const packet = data as NetworkPacket;
      if (packet && packet.senderId !== this.localPlayerId) {
        this.notifyListeners(packet);
      }
    });

    conn.on('close', () => {
      console.log('[Multiplayer] Connection closed');
      this.isConnected = false;
      this.notifyListeners({
        type: 'LEAVE_ROOM',
        senderId: 'system',
        payload: {},
        timestamp: Date.now(),
      });
    });
  }

  public startHeartbeat(packetSupplier: () => NetworkPacket | null) {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      const packet = packetSupplier();
      if (packet) {
        this.sendPacket(packet.type, packet.payload);
      }
    }, 1000);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public sendPacket(type: PacketType, payload: any) {
    const packet: NetworkPacket = {
      type,
      senderId: this.localPlayerId,
      payload,
      timestamp: Date.now(),
    };

    // Send via WebRTC if connected
    if (this.connection) {
      try {
        if (this.connection.open) {
          this.connection.send(packet);
        }
      } catch (err) {
        console.warn('WebRTC send error:', err);
      }
    }

    // Send via BroadcastChannel for local multi-tab / same machine
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (err) {
        console.warn('BroadcastChannel post error:', err);
      }
    }
  }

  public subscribe(callback: PacketCallback): () => void {
    this.packetListeners.add(callback);
    return () => {
      this.packetListeners.delete(callback);
    };
  }

  private notifyListeners(packet: NetworkPacket) {
    this.packetListeners.forEach((listener) => listener(packet));
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.connection) {
      try { this.connection.close(); } catch {}
      this.connection = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch {}
      this.broadcastChannel = null;
    }
    this.isConnected = false;
  }
}

export const multiplayerService = new MultiplayerService();
