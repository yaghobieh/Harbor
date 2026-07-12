import { describe, expect, it, vi } from 'vitest';
import type { IncomingMessage } from 'http';
import { WsHub, MemoryPubSubAdapter, encodeMessage, decodeMessage } from '../src/ws';
import type { WsMessage, WsSocket } from '../src/ws';

class FakeSocket implements WsSocket {
  readyState = 1;
  sent: string[] = [];
  terminated = false;
  closed = false;
  private listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  send(data: string): void {
    this.sent.push(data);
  }

  ping(): void {}

  terminate(): void {
    this.terminated = true;
  }

  close(): void {
    this.closed = true;
    this.emit('close', 1000, Buffer.from(''));
  }

  on(event: string, listener: (...args: never[]) => void): void {
    const existing = this.listeners.get(event) ?? [];
    existing.push(listener as (...args: unknown[]) => void);
    this.listeners.set(event, existing);
  }

  emit(event: string, ...args: unknown[]): void {
    (this.listeners.get(event) ?? []).forEach((listener) => listener(...args));
  }

  lastMessage(): WsMessage | null {
    const raw = this.sent[this.sent.length - 1];
    return raw ? decodeMessage(raw) : null;
  }
}

const fakeRequest = {} as IncomingMessage;

describe('envelope', () => {
  it('encodes and decodes a message', () => {
    const raw = encodeMessage('chat:new', { text: 'hi' });
    expect(decodeMessage(raw)).toEqual({ event: 'chat:new', payload: { text: 'hi' } });
  });

  it('returns null for invalid JSON', () => {
    expect(decodeMessage('not-json')).toBeNull();
  });

  it('returns null when event is missing', () => {
    expect(decodeMessage(JSON.stringify({ payload: 1 }))).toBeNull();
  });

  it('defaults payload to null', () => {
    expect(decodeMessage(JSON.stringify({ event: 'ping' }))).toEqual({
      event: 'ping',
      payload: null,
    });
  });
});

describe('MemoryPubSubAdapter', () => {
  it('delivers published messages to subscribers', async () => {
    const adapter = new MemoryPubSubAdapter();
    const handler = vi.fn();
    await adapter.subscribe('room:1', handler);
    await adapter.publish('room:1', 'hello');
    expect(handler).toHaveBeenCalledWith('room:1', 'hello');
  });

  it('stops delivering after unsubscribe', async () => {
    const adapter = new MemoryPubSubAdapter();
    const handler = vi.fn();
    await adapter.subscribe('room:1', handler);
    await adapter.unsubscribe('room:1');
    await adapter.publish('room:1', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('WsHub', () => {
  it('registers connections and invokes onConnection', () => {
    const onConnection = vi.fn();
    const hub = new WsHub({ onConnection });
    const socket = new FakeSocket();

    const connection = hub.handleConnection(socket, fakeRequest, { userId: 'u1' });

    expect(hub.getConnectionCount()).toBe(1);
    expect(connection.context).toEqual({ userId: 'u1' });
    expect(onConnection).toHaveBeenCalledWith(connection, fakeRequest);
  });

  it('sends typed envelopes through connection.send', () => {
    const hub = new WsHub();
    const socket = new FakeSocket();
    const connection = hub.handleConnection(socket, fakeRequest);

    connection.send('greeting', { hello: true });

    expect(socket.lastMessage()).toEqual({ event: 'greeting', payload: { hello: true } });
  });

  it('routes valid messages to onMessage and rejects invalid envelopes', () => {
    const onMessage = vi.fn();
    const hub = new WsHub({ onMessage });
    const socket = new FakeSocket();
    const connection = hub.handleConnection(socket, fakeRequest);

    socket.emit('message', Buffer.from(encodeMessage('chat:new', 'hi')));
    expect(onMessage).toHaveBeenCalledWith(connection, { event: 'chat:new', payload: 'hi' });

    socket.emit('message', Buffer.from('garbage'));
    expect(socket.lastMessage()?.event).toBe('harbor:error');
  });

  it('broadcasts to room members only', async () => {
    const hub = new WsHub();
    const inRoom = new FakeSocket();
    const outOfRoom = new FakeSocket();
    const member = hub.handleConnection(inRoom, fakeRequest);
    hub.handleConnection(outOfRoom, fakeRequest);

    await hub.join(member, 'room:general');
    await hub.broadcastToRoom('room:general', 'chat:new', { text: 'hello room' });

    expect(inRoom.lastMessage()).toEqual({ event: 'chat:new', payload: { text: 'hello room' } });
    expect(outOfRoom.sent).toHaveLength(0);
  });

  it('broadcasts to all connections', async () => {
    const hub = new WsHub();
    const first = new FakeSocket();
    const second = new FakeSocket();
    hub.handleConnection(first, fakeRequest);
    hub.handleConnection(second, fakeRequest);

    await hub.broadcast('announcement', 'v1.7.0');

    expect(first.lastMessage()).toEqual({ event: 'announcement', payload: 'v1.7.0' });
    expect(second.lastMessage()).toEqual({ event: 'announcement', payload: 'v1.7.0' });
  });

  it('removes empty rooms after leave', async () => {
    const hub = new WsHub();
    const socket = new FakeSocket();
    const connection = hub.handleConnection(socket, fakeRequest);

    await hub.join(connection, 'room:temp');
    expect(hub.getRooms()).toEqual(['room:temp']);

    await hub.leave(connection, 'room:temp');
    expect(hub.getRooms()).toEqual([]);
  });

  it('cleans up rooms and connections on disconnect', async () => {
    const onDisconnect = vi.fn();
    const hub = new WsHub({ onDisconnect });
    const socket = new FakeSocket();
    const connection = hub.handleConnection(socket, fakeRequest);
    await hub.join(connection, 'room:general');

    socket.emit('close', 1001, Buffer.from('going away'));

    expect(hub.getConnectionCount()).toBe(0);
    expect(hub.getRoomMembers('room:general')).toEqual([]);
    expect(onDisconnect).toHaveBeenCalledWith(connection, 1001, 'going away');
  });

  it('sends to a specific connection by id', () => {
    const hub = new WsHub();
    const socket = new FakeSocket();
    const connection = hub.handleConnection(socket, fakeRequest);

    expect(hub.sendTo(connection.id, 'direct', 1)).toBe(true);
    expect(socket.lastMessage()).toEqual({ event: 'direct', payload: 1 });
    expect(hub.sendTo('missing', 'direct', 1)).toBe(false);
  });

  it('fans out through a shared adapter across hubs', async () => {
    const adapter = new MemoryPubSubAdapter();
    const hubA = new WsHub({ adapter });
    const hubB = new WsHub({ adapter });
    const socketA = new FakeSocket();
    const socketB = new FakeSocket();
    const connectionA = hubA.handleConnection(socketA, fakeRequest);
    const connectionB = hubB.handleConnection(socketB, fakeRequest);

    await hubA.join(connectionA, 'room:x');
    await hubB.join(connectionB, 'room:x');
    await hubA.broadcastToRoom('room:x', 'sync', 42);

    expect(socketA.lastMessage()).toEqual({ event: 'sync', payload: 42 });
    expect(socketB.lastMessage()).toEqual({ event: 'sync', payload: 42 });
  });
});
