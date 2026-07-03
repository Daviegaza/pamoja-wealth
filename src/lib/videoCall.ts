/**
 * Voice/video calls — Daily.co primary, LiveKit alt.
 * Chamas on Pro get persistent room; free tier gets 30-min ad-hoc.
 */
import { api } from "@/api/axios";

export interface CallRoom {
  roomName: string;
  url: string;
  token: string;
  expiresAt: string;
  provider: "daily" | "livekit";
}

export async function createChamaRoom(chamaId: string): Promise<CallRoom> {
  const { data } = await api.post<{ success: true; data: CallRoom }>(`/video/rooms`, { chamaId });
  return data.data;
}

export async function joinRoom(roomName: string): Promise<CallRoom> {
  const { data } = await api.post<{ success: true; data: CallRoom }>(`/video/rooms/${roomName}/join`);
  return data.data;
}

/**
 * Iframe embed for Daily. Uses replaceChildren + createElement — no innerHTML.
 */
export function embedRoom(container: HTMLElement, room: CallRoom): { destroy: () => void } {
  const iframe = document.createElement("iframe");
  iframe.src = `${room.url}?t=${encodeURIComponent(room.token)}`;
  iframe.setAttribute("allow", "camera; microphone; fullscreen; speaker; display-capture");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  container.replaceChildren(iframe);
  return {
    destroy: () => {
      container.replaceChildren();
    },
  };
}
