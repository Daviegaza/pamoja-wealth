/**
 * Client-side mirror of the backend payment-provider router. Given a phone
 * number, guess which provider (and country) will handle the charge so we
 * can show a hint on the ContributeModal.
 */
export interface ProviderInfo {
  id: string;
  name: string;
  country: string;
  currency: string;
  icon: string; // emoji fallback until brand assets land
}

const PROVIDERS: Array<{ prefix: string; info: ProviderInfo }> = [
  { prefix: "254", info: { id: "mpesa_ke", name: "M-Pesa Kenya", country: "KE", currency: "KES", icon: "🇰🇪" } },
  { prefix: "255", info: { id: "mpesa_tz", name: "M-Pesa Tanzania", country: "TZ", currency: "TZS", icon: "🇹🇿" } },
  { prefix: "256", info: { id: "mtn_momo_ug", name: "MTN MoMo / Airtel Uganda", country: "UG", currency: "UGX", icon: "🇺🇬" } },
  { prefix: "250", info: { id: "mtn_momo_rw", name: "MTN MoMo Rwanda", country: "RW", currency: "RWF", icon: "🇷🇼" } },
  { prefix: "234", info: { id: "paystack_ng", name: "Paystack / Flutterwave", country: "NG", currency: "NGN", icon: "🇳🇬" } },
];

export function providerForPhone(phone: string): ProviderInfo | null {
  const digits = phone.replace(/[^\d]/g, "");
  for (const { prefix, info } of PROVIDERS) {
    if (digits.startsWith(prefix)) return info;
  }
  return null;
}
