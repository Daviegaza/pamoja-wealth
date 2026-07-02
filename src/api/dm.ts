import { api } from "./axios";

export interface Conversation {
  peerId: string;
  peerName: string;
  peerAvatar: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface DmMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  readAt: string | null;
  createdAt: string;
}

interface Envelope<T> { success: true; data: T; }

export async function listConversations(): Promise<Conversation[]> {
  const r = await api.get<Envelope<{ conversations: Conversation[] }>>("/dm/conversations");
  return r.data.data.conversations ?? [];
}

export async function getDmMessages(peerId: string): Promise<DmMessage[]> {
  const r = await api.get<Envelope<{ messages: DmMessage[] }>>(`/dm/${peerId}/messages`);
  return r.data.data.messages ?? [];
}

export async function sendDm(peerId: string, content: string): Promise<DmMessage> {
  const r = await api.post<Envelope<{ message: DmMessage }>>(`/dm/${peerId}/messages`, { content });
  return r.data.data.message;
}

export async function markDmRead(peerId: string): Promise<{ updated: number }> {
  const r = await api.post<Envelope<{ updated: number }>>(`/dm/${peerId}/read`, {});
  return r.data.data;
}
