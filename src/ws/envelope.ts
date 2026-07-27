import type { WsMessage } from './ws.types';

export function encodeMessage<TPayload>(event: string, payload: TPayload): string {
  return JSON.stringify({ event, payload });
}

export function decodeMessage(raw: string): WsMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'event' in parsed &&
      typeof (parsed as { event: unknown }).event === 'string'
    ) {
      const candidate = parsed as { event: string; payload?: unknown };
      return { event: candidate.event, payload: candidate.payload ?? null };
    }
    return null;
  } catch {
    return null;
  }
}
