import type {
  RedisPubSubAdapterOptions,
  RedisPubSubClient,
  WsPubSubAdapter,
  WsPubSubHandler,
} from './ws.types';
import { EMPTY_CHANNEL_PREFIX, REDIS_ADAPTER_CLOSED_MESSAGE } from './ws.const';

export class RedisPubSubAdapter implements WsPubSubAdapter {
  private publisher: RedisPubSubClient;
  private subscriber: RedisPubSubClient;
  private channelPrefix: string;
  private handlers: Map<string, Set<WsPubSubHandler>> = new Map();
  private messageListenerAttached = false;
  private closed = false;

  constructor(options: RedisPubSubAdapterOptions) {
    this.publisher = options.client;
    this.subscriber = options.subscriber ?? options.client.duplicate();
    this.channelPrefix = options.channelPrefix ?? EMPTY_CHANNEL_PREFIX;
  }

  async publish(channel: string, message: string): Promise<void> {
    this.assertOpen();
    await this.publisher.publish(this.prefixed(channel), message);
  }

  async subscribe(channel: string, handler: WsPubSubHandler): Promise<void> {
    this.assertOpen();
    this.ensureMessageListener();
    const prefixed = this.prefixed(channel);
    if (!this.handlers.has(prefixed)) {
      this.handlers.set(prefixed, new Set());
      await this.subscriber.subscribe(prefixed);
    }
    this.handlers.get(prefixed)!.add(handler);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.assertOpen();
    const prefixed = this.prefixed(channel);
    this.handlers.delete(prefixed);
    await this.subscriber.unsubscribe(prefixed);
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.handlers.clear();
    await Promise.all([
      Promise.resolve(this.subscriber.quit()),
      this.subscriber === this.publisher
        ? Promise.resolve()
        : Promise.resolve(this.publisher.quit()),
    ]);
  }

  private prefixed(channel: string): string {
    return `${this.channelPrefix}${channel}`;
  }

  private ensureMessageListener(): void {
    if (this.messageListenerAttached) return;
    this.messageListenerAttached = true;
    this.subscriber.on('message', (channel, message) => {
      const channelHandlers = this.handlers.get(channel);
      if (!channelHandlers) return;
      const logicalChannel = this.channelPrefix
        ? channel.slice(this.channelPrefix.length)
        : channel;
      channelHandlers.forEach((handler) => handler(logicalChannel, message));
    });
  }

  private assertOpen(): void {
    if (this.closed) {
      throw new Error(REDIS_ADAPTER_CLOSED_MESSAGE);
    }
  }
}

export function createRedisPubSubAdapter(
  options: RedisPubSubAdapterOptions
): RedisPubSubAdapter {
  return new RedisPubSubAdapter(options);
}
