import { getMockDatabase } from "@/mock";
import type { Chama } from "@/types";

export const chamaService = {
  async list(): Promise<Chama[]> {
    await new Promise((r) => setTimeout(r, 300));
    return getMockDatabase().chamas;
  },
  async getById(id: string): Promise<Chama | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDatabase().chamas.find((c) => c.id === id);
  },
};
