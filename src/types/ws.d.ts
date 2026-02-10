declare module 'ws' {
  export class WebSocketServer {
    constructor(options: {
      server?: any;
      path?: string;
      maxPayload?: number;
      perMessageDeflate?: boolean;
      clientTracking?: boolean;
    });
    on(event: string, callback: (...args: any[]) => void): void;
    close(): void;
  }
  
  export class WebSocket {
    static OPEN: number;
    readyState: number;
    send(data: string): void;
    ping(): void;
    terminate(): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }
  
  export default { WebSocketServer, WebSocket };
}

