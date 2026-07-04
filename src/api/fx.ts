import { api } from "./axios";

export type Currency = "KES" | "UGX" | "TZS" | "RWF" | "NGN" | "USD" | "EUR" | "GBP";

export interface FxRatesDTO {
  base: Currency;
  rates: Record<Currency, number>;
  updatedAt: string;
}

export interface FxConvertResult {
  amount: number;
  currency: Currency;
  formatted: string;
}

interface Envelope<T> { success: true; data: T; }

export async function getRates(): Promise<FxRatesDTO> {
  const r = await api.get<Envelope<FxRatesDTO>>("/fx/rates");
  return r.data.data;
}

export async function convert(amount: number, from: Currency, to: Currency): Promise<FxConvertResult> {
  const r = await api.get<Envelope<FxConvertResult>>("/fx/convert", { params: { amount, from, to } });
  return r.data.data;
}
