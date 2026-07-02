import { api } from "./axios";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatPayload {
  messages: AIMessage[];
  chamaId?: string;
}

export interface ChatResponse {
  message: AIMessage;
}

export interface InsightsPayload {
  chamaId?: string;
}

export interface HealthScorePayload {
  chamaId?: string;
}

export interface HealthScoreResponse {
  score: number;
  details: { category: string; score: number; comment: string }[];
}

interface Envelope<T> {
  success: true;
  data: T;
}

export async function chat(payload: ChatPayload): Promise<ChatResponse> {
  const r = await api.post<Envelope<ChatResponse>>("/ai/chat", payload);
  return r.data.data;
}

export async function getInsights(payload: InsightsPayload = {}): Promise<string[]> {
  const r = await api.post<Envelope<{ insights: string[] }>>("/ai/insights", payload);
  return r.data.data.insights;
}

export async function getHealthScore(
  payload: HealthScorePayload = {}
): Promise<HealthScoreResponse> {
  const r = await api.post<Envelope<HealthScoreResponse>>("/ai/health-score", payload);
  return r.data.data;
}
