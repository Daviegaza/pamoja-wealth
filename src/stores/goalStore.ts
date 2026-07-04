import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  listGoals as apiList,
  createGoal as apiCreate,
  updateGoal as apiUpdate,
  deleteGoal as apiDelete,
} from "@/api/goals";

import { USE_MOCKS } from "@/lib/env";
void USE_MOCKS;

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
}

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  sync: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "currentAmount" | "createdAt" | "userId">) => Promise<Goal>;
  updateGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const seed: Goal[] = [
  {
    id: "goal_1",
    userId: "usr_1",
    name: "Emergency Fund",
    targetAmount: 500_000,
    currentAmount: 185_000,
    targetDate: new Date(Date.now() + 365 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: seed,
      isLoading: false,

      sync: async () => {
        if (USE_MOCKS) return;
        set({ isLoading: true });
        try {
          const items = await apiList();
          const mapped: Goal[] = items.map((g) => ({
            id: g.id,
            userId: g.userId,
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            targetDate: g.targetDate,
            createdAt: g.createdAt,
          }));
          set({ goals: mapped });
        } catch (err) {
          console.warn("[goalStore] sync failed", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addGoal: async (goal) => {
        const optimistic: Goal = {
          ...goal,
          id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: "usr_1",
          currentAmount: 0,
          createdAt: new Date().toISOString(),
        };
        set({ goals: [...get().goals, optimistic] });

        if (USE_MOCKS) return optimistic;

        try {
          const created = await apiCreate({
            name: goal.name,
            targetAmount: goal.targetAmount,
            targetDate: goal.targetDate,
          });
          const real: Goal = {
            id: created.id,
            userId: created.userId,
            name: created.name,
            targetAmount: created.targetAmount,
            currentAmount: created.currentAmount,
            targetDate: created.targetDate,
            createdAt: created.createdAt,
          };
          set({ goals: get().goals.map((g) => (g.id === optimistic.id ? real : g)) });
          return real;
        } catch (err) {
          set({ goals: get().goals.filter((g) => g.id !== optimistic.id) });
          throw err;
        }
      },

      updateGoal: async (id, amount) => {
        const prev = get().goals;
        const target = prev.find((g) => g.id === id);
        if (!target) return;
        const nextAmount = target.currentAmount + amount;
        set({
          goals: prev.map((g) => (g.id === id ? { ...g, currentAmount: nextAmount } : g)),
        });
        if (USE_MOCKS) return;
        try {
          await apiUpdate(id, { currentAmount: nextAmount });
        } catch (err) {
          set({ goals: prev });
          throw err;
        }
      },

      deleteGoal: async (id) => {
        const prev = get().goals;
        set({ goals: prev.filter((g) => g.id !== id) });
        if (USE_MOCKS) return;
        try {
          await apiDelete(id);
        } catch (err) {
          set({ goals: prev });
          throw err;
        }
      },
    }),
    { name: "pamoja-goals" }
  )
);
