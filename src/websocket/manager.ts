import { Server as HttpServer } from 'http';
import { createLogger } from '../utils/logger';
import type { WebSocketOptions, HarborWebSocket, Room } from './types';

const logger = createLogger('websocket');

export class WebSocketManager {
  private wss: unknown = null;
  private clients: Map<string, HarborWebSocket> = new Map();
  private rooms: Map<string, Room> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private options: WebSocketOptions;

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      path: '/ws',
      maxPayload: 1024 * 1024,
      perMessageDeflate: false,
      clientTracking: true,
      heartbeatInterval: 30000,
      ...options,
    };
  }

  async attach(server: HttpServer): Promise<unknown> {
    try {
      const ws = await import('ws');
      const WebSocketServer = ws.WebSocketServer || ws.default?.WebSocketServer;
      
      this.wss = new WebSocketServer({
        server,
        path: this.options.path,
        maxPayload: this.options.maxPayload,
        perMessageDeflate: this.options.perMessageDeflate,
        clientTracking: this.options.clientTracking,
      });

      (this.wss as any).on('connection', (wsClient: any, request: unknown) => {
        const client = this.enhanceClient(wsClient);
        this.clients.set(client.id, client);

        logger.info(`WebSocket client connected: ${client.id}`);
        this.options.onConnection?.(client, request);

        wsClient.on('message', (data: Buffer) => {
          this.handleMessage(client, data);
        });

        wsClient.on('close', (code: number, reason: Buffer) => {
          this.handleDisconnect(client, code, reason.toString());
        });

        wsClient.on('error', (error: Error) => {
          logger.error(`WebSocket error for ${client.id}:`, error);
          this.options.onError?.(client, error);
        });

        wsClient.on('pong', () => {
          client.isAlive = true;
        });
      });

      this.startHeartbeat();
      logger.info(`WebSocket server started on path ${this.options.path}`);

      return this.wss;
    } catch (error) {
      logger.warn('WebSocket not available. Install ws package: npm i ws');
      throw error;
    }
  }

  private handleMessage(client: HarborWebSocket, data: Buffer): void {
    try {
      const parsed = JSON.parse(data.toString());
      this.options.onMessage?.(client, parsed);
    } catch {
      this.options.onMessage?.(client, data.toString());
    }
  }

  private enhanceClient(ws: unknown): HarborWebSocket {
    const client = ws as HarborWebSocket;
    client.id = this.generateId();
    client.isAlive = true;
    client.data = {};
    client.rooms = new Set();
    return client;
  }

  private generateId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private handleDisconnect(client: HarborWebSocket, code: number, reason: string): void {
    client.rooms.forEach((roomName) => {
      this.leave(client, roomName);
    });
    this.clients.delete(client.id);
    logger.info(`WebSocket client disconnected: ${client.id} (${code})`);
    this.options.onClose?.(client, code, reason);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive) {
          client.terminate();
          return;
        }
        client.isAlive = false;
        client.ping();
      });
    }, this.options.heartbeatInterval);
  }

  join(client: HarborWebSocket, roomName: string): void {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, { name: roomName, clients: new Set() });
    }
    const room = this.rooms.get(roomName)!;
    room.clients.add(client);
    client.rooms.add(roomName);
    logger.debug(`Client ${client.id} joined room ${roomName}`);
  }

  leave(client: HarborWebSocket, roomName: string): void {
    const room = this.rooms.get(roomName);
    if (room) {
      room.clients.delete(client);
      client.rooms.delete(roomName);
      if (room.clients.size === 0) {
        this.rooms.delete(roomName);
      }
      logger.debug(`Client ${client.id} left room ${roomName}`);
    }
  }

  broadcast(data: unknown, exclude?: HarborWebSocket): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client !== exclude && client.readyState === 1) {
        client.send(message);
      }
    });
  }

  broadcastToRoom(roomName: string, data: unknown, exclude?: HarborWebSocket): void {
    const room = this.rooms.get(roomName);
    if (!room) return;

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    room.clients.forEach((client) => {
      if (client !== exclude && client.readyState === 1) {
        client.send(message);
      }
    });
  }

  send(clientId: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (client && client.readyState === 1) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      client.send(message);
      return true;
    }
    return false;
  }

  getClient(id: string): HarborWebSocket | undefined {
    return this.clients.get(id);
  }

  getClients(): HarborWebSocket[] {
    return Array.from(this.clients.values());
  }

  getRoom(name: string): Room | undefined {
    return this.rooms.get(name);
  }

  getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  getClientCount(): number {
    return this.clients.size;
  }

  close(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    (this.wss as any)?.close?.();
    this.clients.clear();
    this.rooms.clear();
    logger.info('WebSocket server closed');
  }
}

export function createWebSocketServer(options?: WebSocketOptions): WebSocketManager {
  return new WebSocketManager(options);
}

