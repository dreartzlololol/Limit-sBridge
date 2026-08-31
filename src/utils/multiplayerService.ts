import Peer from 'peerjs';
import type { NetworkPacket, PacketType } from '../types/multiplayer';

export type PacketCallback = (packet: NetworkPacket) => void;

class MultiplayerService {
  private peer: Peer | null = null;
  private connection: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private packetListeners: Set<PacketCallback> = new Set();
  private localPlayerId: string = '';
  private currentRoomCode: string = '';

  constructor() {
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
  }

  public getPlayerId(): string {
    return this.localPlayerId;
  }

  public getRoomCode(): string {
    return this.currentRoomCode;
  }

  // Generate 4-digit numeric/alpha code e.g. "8842"
  public generateRoomCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Start hosting a room
  public async createRoom(roomCode: string): Promise<boolean> {
    this.currentRoomCode = roomCode;
    this.initBroadcastChannel(roomCode);

    return new Promise((resolve) => {
      const peerId = `limitbridge-room-${roomCode.toLowerCase()}`;
      
      try {
        if (this.peer) this.peer.destroy();
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', () => {
          console.log(`[Multiplayer] Peer Host open: ${peerId}`);
          resolve(true);
        });

        this.peer.on('connection', (conn) => {
          console.log(`[Multiplayer] Incoming connection from: ${conn.peer}`);
          this.connection = conn;
          this.setupConnectionListeners(conn);
        });

        this.peer.on('error', (err) => {
          console.warn(`[Multiplayer] Peer Host warning/error:`, err);
          // Still resolve true because BroadcastChannel will handle local multi-tab!
          resolve(true);
        });
      } catch (e) {
        console.warn(`[Multiplayer] Peer init fallback to BroadcastChannel:`, e);
        resolve(true);
      }
    });
  }

  // Join existing host room
  public async joinRoom(roomCode: string): Promise<boolean> {
    this.currentRoomCode = roomCode;
    this.initBroadcastChannel(roomCode);

    return new Promise((resolve) => {
      const targetPeerId = `limitbridge-room-${roomCode.toLowerCase()}`;
      
      try {
        if (this.peer) this.peer.destroy();
        this.peer = new Peer({
          debug: 1,
        });

        this.peer.on('open', () => {
          console.log(`[Multiplayer] Client Peer initialized, connecting to ${targetPeerId}`);
          if (!this.peer) return;

          const conn = this.peer.connect(targetPeerId, { reliable: true });
          this.connection = conn;

          conn.on('open', () => {
            console.log(`[Multiplayer] WebRTC connected to host!`);
            this.setupConnectionListeners(conn);
            resolve(true);
          });

          conn.on('error', (err) => {
            console.warn(`[Multiplayer] WebRTC connection error:`, err);
            resolve(true); // Fallback to BroadcastChannel
          });

          setTimeout(() => {
            // If connection takes > 3s, resolve true so BroadcastChannel can still work
            resolve(true);
          }, 3000);
        });

        this.peer.on('error', (err) => {
          console.warn(`[Multiplayer] Peer client error:`, err);
          resolve(true);
        });
      } catch (e) {
        console.warn(`[Multiplayer] Peer join fallback to BroadcastChannel:`, e);
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
      this.notifyListeners({
        type: 'LEAVE_ROOM',
        senderId: 'system',
        payload: {},
        timestamp: Date.now(),
      });
    });
  }

  public sendPacket(type: PacketType, payload: any) {
    const packet: NetworkPacket = {
      type,
      senderId: this.localPlayerId,
      payload,
      timestamp: Date.now(),
    };

    // Send via WebRTC if connected
    if (this.connection && this.connection.open) {
      try {
        this.connection.send(packet);
      } catch (err) {
        console.warn('WebRTC send error:', err);
      }
    }

    // Send via BroadcastChannel for local tabs
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
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
}

export const multiplayerService = new MultiplayerService();
