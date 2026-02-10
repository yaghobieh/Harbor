export interface WebSocketOptions {
  path?: string;
  maxPayload?: number;
  perMessageDeflate?: boolean;
  clientTracking?: boolean;
  heartbeatInterval?: number;
  onConnection?: (client: HarborWebSocket, request: unknown) => void;
  onMessage?: (client: HarborWebSocket, data: unknown) => void;
  onClose?: (client: HarborWebSocket, code: number, reason: string) => void;
  onError?: (client: HarborWebSocket, error: Error) => void;
}

export interface HarborWebSocket {
  id: string;
  isAlive: boolean;
  data: Record<string, unknown>;
  rooms: Set<string>;
  readyState: number;
  send: (data: string) => void;
  ping: () => void;
  terminate: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}

export interface Room {
  name: string;
  clients: Set<HarborWebSocket>;
}

