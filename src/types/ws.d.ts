declare module 'ws' {
  export class WebSocketServer {
    constructor(options: {
      server?: any;
      noServer?: boolean;
      path?: string;
      maxPayload?: number;
      perMessageDeflate?: boolean;
      clientTracking?: boolean;
    });
    handleUpgrade(
      request: unknown,
      socket: unknown,
      head: unknown,
      callback: (client: WebSocket, request: unknown) => void
    ): void;
    on(event: string, callback: (...args: any[]) => void): void;
    close(): void;
  }
  
  export class WebSocket {
    static OPEN: number;
    readyState: number;
    send(data: string): void;
    ping(): void;
    terminate(): void;
    close(code?: number, reason?: string): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }
  
  export default { WebSocketServer, WebSocket };
}
