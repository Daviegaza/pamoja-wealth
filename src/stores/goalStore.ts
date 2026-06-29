import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  addGoal: (goal: Omit<Goal, "id" | "currentAmount" | "createdAt">) => void;
  updateGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [
        {
          id: "goal_1",
          userId: "usr_1",
          name: "Emergency Fund",
          targetAmount: 500_000,
          currentAmount: 185_000,
          targetDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        },
      ],
      addGoal: (goal) =>
        set({
          goals: [
            ...get().goals,
            {
              ...goal,
              id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              currentAmount: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      updateGoal: (id, amount) =>
        set({
          goals: get().goals.map((g) =>
            g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
          ),
        }),
      deleteGoal: (id) =>
        set({
          goals: get().goals.filter((g) => g.id !== id),
        }),
    }),
    { name: "pamoja-goals" }
  )
);
