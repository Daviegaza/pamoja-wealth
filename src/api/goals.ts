import { api } from "./axios";

export interface GoalDTO {
  id: string;
  userId: string;
  chamaId: string | null;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  targetDate: string;
  chamaId?: string;
}

export interface UpdateGoalPayload {
  currentAmount?: number;
  name?: string;
  targetAmount?: number;
  targetDate?: string;
}

interface Envelope<T> { success: true; data: T; }

export async function listGoals(): Promise<GoalDTO[]> {
  const r = await api.get<Envelope<GoalDTO[]>>("/goals");
  return r.data.data;
}

export async function createGoal(payload: CreateGoalPayload): Promise<GoalDTO> {
  const r = await api.post<Envelope<GoalDTO>>("/goals", payload);
  return r.data.data;
}

export async function updateGoal(id: string, payload: UpdateGoalPayload): Promise<GoalDTO> {
  const r = await api.patch<Envelope<GoalDTO>>(`/goals/${id}`, payload);
  return r.data.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}
