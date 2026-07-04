import { api } from "./axios";

interface Envelope<T> { success: true; data: T }

export interface ImpactSnapshot {
  chamasActive: number;
  membersServed: number;
  contributionsKes: number;
  loansIssuedKes: number;
  harambeeRaisedKes: number;
  countries: number;
  computedAt: string;
  cached: boolean;
}

export interface LessonSummary {
  slug: string;
  title: string;
  titleSw: string;
  minutes: number;
  category: "basics" | "chama" | "loans" | "investing" | "safety";
  action: string;
}

export interface Lesson extends LessonSummary {
  body: string;
  bodySw: string;
  keyPoints: string[];
}

export async function getImpact(): Promise<ImpactSnapshot> {
  const r = await api.get<Envelope<ImpactSnapshot>>("/public/impact");
  return r.data.data;
}

export async function listLessons(): Promise<LessonSummary[]> {
  const r = await api.get<Envelope<LessonSummary[]>>("/public/lessons");
  return r.data.data;
}

export async function getLesson(slug: string): Promise<Lesson> {
  const r = await api.get<Envelope<Lesson>>(`/public/lessons/${slug}`);
  return r.data.data;
}

export async function completeLesson(slug: string): Promise<void> {
  await api.post(`/public/lessons/${slug}/complete`);
}
