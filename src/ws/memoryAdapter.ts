import type { WsPubSubAdapter, WsPubSubHandler } from './ws.types';

export class MemoryPubSubAdapter implements WsPubSubAdapter {
  private handlers: Map<string, Set<WsPubSubHandler>> = new Map();

  async publish(channel: string, message: string): Promise<void> {
    const channelHandlers = this.handlers.get(channel);
    if (!channelHandlers) return;
    channelHandlers.forEach((handler) => handler(channel, message));
  }

  async subscribe(channel: string, handler: WsPubSubHandler): Promise<void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.handlers.delete(channel);
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}

export function createMemoryPubSubAdapter(): MemoryPubSubAdapter {
  return new MemoryPubSubAdapter();
}
