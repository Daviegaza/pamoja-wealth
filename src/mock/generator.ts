// Deterministic pseudo-random generator so mock data is stable across reloads
let seed = 42;

export function seedRandom(s: number): void {
  seed = s;
}

export function rand(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number, decimals = 2): number {
  const val = rand() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function pickMany<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = randInt(0, copy.length - 1);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function randomDateBetween(start: Date, end: Date): string {
  const time = start.getTime() + rand() * (end.getTime() - start.getTime());
  return new Date(time).toISOString();
}

export const FIRST_NAMES = [
  "Wanjiru", "Otieno", "Akinyi", "Kamau", "Njoroge", "Achieng", "Mwangi", "Wambui",
  "Kiprotich", "Chebet", "Omondi", "Nyambura", "Kariuki", "Adhiambo", "Mutua", "Wairimu",
  "Korir", "Naliaka", "Were", "Muthoni", "Onyango", "Cherono", "Kibet", "Wafula",
  "Atieno", "Maina", "Njeri", "Odinga", "Kemboi", "Wanjala", "Auma", "Gitau",
  "Amani", "Zawadi", "Imani", "Jabari", "Kesi", "Lulu", "Nia", "Rafiki",
];

export const LAST_NAMES = [
  "Mwangi", "Otieno", "Kamau", "Wanjiru", "Kiprotich", "Achieng", "Njoroge", "Wambui",
  "Korir", "Chebet", "Omondi", "Nyambura", "Kariuki", "Adhiambo", "Mutua", "Wairimu",
  "Cherono", "Were", "Naliaka", "Muthoni", "Onyango", "Kibet", "Wafula", "Atieno",
];

export function randomFullName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export const CHAMA_NAMES = [
  "Umoja Savings Group", "Mafanikio Investment Club", "Tujenge Together", "Pamoja Pioneers",
  "Harambee Wealth Circle", "Stawisha Sacco", "Ushindi Investors", "Furaha Welfare Group",
  "Maendeleo Capital", "Imara Women in Finance", "Nuru Youth Fund", "Baraka Builders",
  "Tumaini Growth Group", "Faraja Savers", "Kilele Investment Trust", "Jasiri Ventures",
  "Mwangaza Cooperative", "Heshima Holdings", "Amani Real Estate Group", "Bidii Capital",
];

export const LOCATIONS = [
  "Nairobi, Kenya", "Mombasa, Kenya", "Kisumu, Kenya", "Nakuru, Kenya", "Eldoret, Kenya",
  "Kampala, Uganda", "Dar es Salaam, Tanzania", "Kigali, Rwanda", "Lagos, Nigeria", "Accra, Ghana",
];

export const LOAN_PURPOSES = [
  "Business expansion", "School fees", "Medical emergency", "Home renovation",
  "Land purchase", "Vehicle purchase", "Wedding expenses", "Agricultural investment",
  "Debt consolidation", "Equipment financing",
];

export const AVATAR_COLORS = ["16A34A", "2563EB", "DB2777", "EA580C", "7C3AED", "0891B2", "CA8A04", "DC2626"];

export function avatarUrl(name: string, idx: number): string {
  const bg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true`;
}
