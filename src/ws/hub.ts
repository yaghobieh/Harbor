import type { IncomingMessage, Server as HttpServer } from 'http';
import type { Duplex } from 'stream';
import type { WebSocketServer } from 'ws';
import { createLogger } from '../utils/logger';
import type {
  WsAuthResult,
  WsConnection,
  WsConnectionContext,
  WsHubOptions,
  WsPubSubAdapter,
  WsSocket,
} from './ws.types';
import { encodeMessage, decodeMessage } from './envelope';
import { MemoryPubSubAdapter } from './memoryAdapter';
import {
  BROADCAST_CHANNEL,
  CONNECTION_ID_PREFIX,
  DEFAULT_UNAUTHORIZED_REASON,
  DEFAULT_WS_PATH,
  INVALID_MESSAGE_REASON,
  ROOM_CHANNEL_PREFIX,
  WS_ERROR_EVENT,
  WS_MODULE_MISSING_MESSAGE,
} from './ws.const';
import {
  CONNECTION_ID_RADIX,
  CONNECTION_ID_RANDOM_LENGTH,
  DEFAULT_HEARTBEAT_INTERVAL_MS,
  DEFAULT_MAX_PAYLOAD_BYTES,
  DEFAULT_UNAUTHORIZED_STATUS,
  WS_OPEN_STATE,
} from './numbers.const';
import { HTTP_STATUS_MESSAGES } from '../constants';

const logger = createLogger('ws');

interface InternalConnection {
  connection: WsConnection;
  socket: WsSocket;
  isAlive: boolean;
  rooms: Set<string>;
}

interface ResolvedWsHubOptions {
  path: string;
  maxPayloadBytes: number;
  heartbeatIntervalMs: number;
  rejectUnmatchedUpgrades: boolean;
  authenticate?: WsHubOptions['authenticate'];
  onConnection?: WsHubOptions['onConnection'];
  onMessage?: WsHubOptions['onMessage'];
  onDisconnect?: WsHubOptions['onDisconnect'];
  onError?: WsHubOptions['onError'];
}

export class WsHub {
  private options: ResolvedWsHubOptions;
  private adapter: WsPubSubAdapter;
  private connections: Map<string, InternalConnection> = new Map();
  private rooms: Map<string, Set<InternalConnection>> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private wss: WebSocketServer | null = null;
  private broadcastSubscribed = false;

  constructor(options: WsHubOptions = {}) {
    this.options = {
      path: options.path ?? DEFAULT_WS_PATH,
      maxPayloadBytes: options.maxPayloadBytes ?? DEFAULT_MAX_PAYLOAD_BYTES,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS,
      rejectUnmatchedUpgrades: options.rejectUnmatchedUpgrades ?? false,
      authenticate: options.authenticate,
      onConnection: options.onConnection,
      onMessage: options.onMessage,
      onDisconnect: options.onDisconnect,
      onError: options.onError,
    };
    this.adapter = options.adapter ?? new MemoryPubSubAdapter();
  }

  async attach(server: HttpServer): Promise<void> {
    const wsModule = await this.loadWsModule();
    const WebSocketServerCtor = wsModule.WebSocketServer ?? wsModule.default?.WebSocketServer;
    this.wss = new WebSocketServerCtor({
      noServer: true,
      maxPayload: this.options.maxPayloadBytes,
    });

    await this.ensureBroadcastSubscription();

    server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      void this.handleUpgrade(request, socket, head);
    });

    this.startHeartbeat();
    logger.info(`WebSocket hub attached on path ${this.options.path}`);
  }

  private async loadWsModule(): Promise<typeof import('ws')> {
    try {
      return await import('ws');
    } catch {
      throw new Error(WS_MODULE_MISSING_MESSAGE);
    }
  }

  private async handleUpgrade(
    request: IncomingMessage,
    socket: Duplex,
    head: Buffer
  ): Promise<void> {
    const requestPath = (request.url ?? '').split('?')[0];
    if (requestPath !== this.options.path) {
      if (this.options.rejectUnmatchedUpgrades) {
        socket.destroy();
      }
      return;
    }

    const authResult = await this.resolveAuth(request);
    if (!authResult.accept) {
      const status = authResult.status ?? DEFAULT_UNAUTHORIZED_STATUS;
      const statusMessage = HTTP_STATUS_MESSAGES[status] ?? DEFAULT_UNAUTHORIZED_REASON;
      socket.write(`HTTP/1.1 ${status} ${statusMessage}\r\nConnection: close\r\n\r\n`);
      socket.destroy();
      return;
    }

    this.wss?.handleUpgrade(request, socket, head, (client: WsSocket) => {
      this.handleConnection(client, request, authResult.context ?? {});
    });
  }

  private async resolveAuth(request: IncomingMessage): Promise<WsAuthResult> {
    if (!this.options.authenticate) {
      return { accept: true };
    }
    try {
      return await this.options.authenticate(request);
    } catch (error) {
      this.options.onError?.(error as Error);
      return { accept: false };
    }
  }

  handleConnection(
    socket: WsSocket,
    request: IncomingMessage,
    context: WsConnectionContext = {}
  ): WsConnection {
    const rooms = new Set<string>();
    const id = this.generateConnectionId();

    const connection: WsConnection = {
      id,
      context,
      rooms,
      send: <TPayload>(event: string, payload: TPayload): void => {
        if (socket.readyState === WS_OPEN_STATE) {
          socket.send(encodeMessage(event, payload));
        }
      },
      close: (code?: number, reason?: string): void => {
        socket.close(code, reason);
      },
    };

    const internal: InternalConnection = { connection, socket, isAlive: true, rooms };
    this.connections.set(id, internal);

    socket.on('message', (data: Buffer | string) => {
      this.handleMessage(internal, data.toString());
    });

    socket.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnect(internal, code, reason.toString());
    });

    socket.on('error', (error: Error) => {
      this.options.onError?.(error, connection);
    });

    socket.on('pong', () => {
      internal.isAlive = true;
    });

    logger.info(`WebSocket connection opened: ${id}`);
    this.options.onConnection?.(connection, request);
    return connection;
  }

  private handleMessage(internal: InternalConnection, raw: string): void {
    const message = decodeMessage(raw);
    if (!message) {
      internal.connection.send(WS_ERROR_EVENT, { reason: INVALID_MESSAGE_REASON });
      return;
    }
    this.options.onMessage?.(internal.connection, message);
  }

  private handleDisconnect(internal: InternalConnection, code: number, reason: string): void {
    Array.from(internal.rooms).forEach((room) => {
      void this.leave(internal.connection, room);
    });
    this.connections.delete(internal.connection.id);
    logger.info(`WebSocket connection closed: ${internal.connection.id} (${code})`);
    this.options.onDisconnect?.(internal.connection, code, reason);
  }

  private generateConnectionId(): string {
    const random = Math.random()
      .toString(CONNECTION_ID_RADIX)
      .substring(2, 2 + CONNECTION_ID_RANDOM_LENGTH);
    return `${CONNECTION_ID_PREFIX}_${Date.now()}_${random}`;
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    this.heartbeatTimer = setInterval(() => {
      this.connections.forEach((internal) => {
        if (!internal.isAlive) {
          internal.socket.terminate();
          return;
        }
        internal.isAlive = false;
        internal.socket.ping();
      });
    }, this.options.heartbeatIntervalMs);
  }

  private roomChannel(room: string): string {
    return `${ROOM_CHANNEL_PREFIX}${room}`;
  }

  private async ensureBroadcastSubscription(): Promise<void> {
    if (this.broadcastSubscribed) return;
    this.broadcastSubscribed = true;
    await this.adapter.subscribe(BROADCAST_CHANNEL, (_channel, message) => {
      this.deliverToAll(message);
    });
  }

  private deliverToAll(message: string): void {
    this.connections.forEach((internal) => {
      if (internal.socket.readyState === WS_OPEN_STATE) {
        internal.socket.send(message);
      }
    });
  }

  private deliverToRoom(room: string, message: string): void {
    const members = this.rooms.get(room);
    if (!members) return;
    members.forEach((internal) => {
      if (internal.socket.readyState === WS_OPEN_STATE) {
        internal.socket.send(message);
      }
    });
  }

  async join(connection: WsConnection, room: string): Promise<void> {
    const internal = this.connections.get(connection.id);
    if (!internal) return;

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
      await this.adapter.subscribe(this.roomChannel(room), (_channel, message) => {
        this.deliverToRoom(room, message);
      });
    }
    this.rooms.get(room)!.add(internal);
    internal.rooms.add(room);
    logger.debug(`Connection ${connection.id} joined room ${room}`);
  }

  async leave(connection: WsConnection, room: string): Promise<void> {
    const internal = this.connections.get(connection.id);
    const members = this.rooms.get(room);
    if (!internal || !members) return;

    members.delete(internal);
    internal.rooms.delete(room);
    if (members.size === 0) {
      this.rooms.delete(room);
      await this.adapter.unsubscribe(this.roomChannel(room));
    }
    logger.debug(`Connection ${connection.id} left room ${room}`);
  }

  async broadcast<TPayload>(event: string, payload: TPayload): Promise<void> {
    await this.ensureBroadcastSubscription();
    await this.adapter.publish(BROADCAST_CHANNEL, encodeMessage(event, payload));
  }

  async broadcastToRoom<TPayload>(room: string, event: string, payload: TPayload): Promise<void> {
    await this.adapter.publish(this.roomChannel(room), encodeMessage(event, payload));
  }

  sendTo<TPayload>(connectionId: string, event: string, payload: TPayload): boolean {
    const internal = this.connections.get(connectionId);
    if (!internal || internal.socket.readyState !== WS_OPEN_STATE) {
      return false;
    }
    internal.socket.send(encodeMessage(event, payload));
    return true;
  }

  getConnection(id: string): WsConnection | undefined {
    return this.connections.get(id)?.connection;
  }

  getConnections(): WsConnection[] {
    return Array.from(this.connections.values()).map((internal) => internal.connection);
  }

  getRoomMembers(room: string): WsConnection[] {
    const members = this.rooms.get(room);
    if (!members) return [];
    return Array.from(members).map((internal) => internal.connection);
  }

  getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  async close(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.connections.forEach((internal) => internal.socket.terminate());
    this.connections.clear();
    this.rooms.clear();
    this.wss?.close();
    await this.adapter.close();
    logger.info('WebSocket hub closed');
  }
}

export function createWsHub(options?: WsHubOptions): WsHub {
  return new WsHub(options);
}
