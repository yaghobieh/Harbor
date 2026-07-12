import type { IncomingMessage } from 'http';

export interface WsMessage<TPayload = unknown> {
  event: string;
  payload: TPayload;
}

export type WsConnectionContext = Record<string, unknown>;

export interface WsSocket {
  readyState: number;
  send(data: string): void;
  ping(): void;
  terminate(): void;
  close(code?: number, reason?: string): void;
  on(event: 'message', listener: (data: Buffer | string) => void): void;
  on(event: 'close', listener: (code: number, reason: Buffer) => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
  on(event: 'pong', listener: () => void): void;
}

export interface WsConnection {
  id: string;
  context: WsConnectionContext;
  rooms: ReadonlySet<string>;
  send<TPayload>(event: string, payload: TPayload): void;
  close(code?: number, reason?: string): void;
}

export type WsAuthResult =
  | { accept: true; context?: WsConnectionContext }
  | { accept: false; status?: number; reason?: string };

export type WsAuthenticate = (
  request: IncomingMessage
) => WsAuthResult | Promise<WsAuthResult>;

export type WsPubSubHandler = (channel: string, message: string) => void;

export interface WsPubSubAdapter {
  publish(channel: string, message: string): Promise<void>;
  subscribe(channel: string, handler: WsPubSubHandler): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  close(): Promise<void>;
}

export interface WsHubOptions {
  path?: string;
  maxPayloadBytes?: number;
  heartbeatIntervalMs?: number;
  rejectUnmatchedUpgrades?: boolean;
  authenticate?: WsAuthenticate;
  adapter?: WsPubSubAdapter;
  onConnection?: (connection: WsConnection, request: IncomingMessage) => void;
  onMessage?: (connection: WsConnection, message: WsMessage) => void;
  onDisconnect?: (connection: WsConnection, code: number, reason: string) => void;
  onError?: (error: Error, connection?: WsConnection) => void;
}
