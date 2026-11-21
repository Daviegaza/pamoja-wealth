import { api } from "./axios";
import type { Envelope } from "./http-types";

export interface GoalDTO {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
}

export interface GoalInput {
  name: string;
  targetAmount: number;
  targetDate: string;
}

export async function listGoals(chamaId: string) {
  const r = await api.get<Envelope<GoalDTO[]>>(`/chamas/${chamaId}/goals`);
  return r.data.data;
}

export async function createGoal(chamaId: string, input: GoalInput) {
  const r = await api.post<Envelope<GoalDTO>>(`/chamas/${chamaId}/goals`, input);
  return r.data.data;
}

export async function updateGoal(chamaId: string, goalId: string, input: Partial<GoalInput>) {
  const r = await api.patch<Envelope<GoalDTO>>(`/chamas/${chamaId}/goals/${goalId}`, input);
  return r.data.data;
}

export async function deleteGoal(chamaId: string, goalId: string) {
  await api.delete(`/chamas/${chamaId}/goals/${goalId}`);
}
