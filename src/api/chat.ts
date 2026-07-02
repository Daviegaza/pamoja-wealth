import { api } from "./axios";

export interface ChatMessageDTO {
  id: string;
  chamaId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

interface Envelope<T> { success: true; data: T; }

export async function getChatMessages(
  chamaId: string,
  opts?: { before?: string; limit?: number }
): Promise<ChatMessageDTO[]> {
  const r = await api.get<Envelope<{ messages: ChatMessageDTO[] } | ChatMessageDTO[]>>(
    `/chat/chamas/${chamaId}/messages`,
    { params: opts }
  );
  const d = r.data.data as { messages?: ChatMessageDTO[] } | ChatMessageDTO[];
  return Array.isArray(d) ? d : d.messages ?? [];
}

export async function sendChatMessage(chamaId: string, content: string): Promise<ChatMessageDTO> {
  const r = await api.post<Envelope<{ message: ChatMessageDTO } | ChatMessageDTO>>(
    `/chat/chamas/${chamaId}/messages`,
    { content }
  );
  const d = r.data.data as { message?: ChatMessageDTO } | ChatMessageDTO;
  return (d as { message?: ChatMessageDTO }).message ?? (d as ChatMessageDTO);
}
