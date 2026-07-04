import { api } from "./axios";

export type TicketCategory = "payment" | "kyc" | "account" | "chama" | "bug" | "other";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface CreateTicketPayload {
  subject: string;
  message: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

export interface TicketDTO {
  id: string;
  userId: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
}

interface Envelope<T> { success: true; data: T; }

export async function createTicket(payload: CreateTicketPayload): Promise<TicketDTO> {
  const r = await api.post<Envelope<TicketDTO>>("/support/tickets", payload);
  return r.data.data;
}

export async function listTickets(): Promise<TicketDTO[]> {
  const r = await api.get<Envelope<TicketDTO[]>>("/support/tickets");
  return r.data.data;
}
