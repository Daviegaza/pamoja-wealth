import { useMemo, useState } from "react";

export function useFilter<T, K extends keyof T>(items: T[], key: K) {
  const [value, setValue] = useState<T[K] | "all">("all");

  const results = useMemo(() => {
    if (value === "all") return items;
    return items.filter((item) => item[key] === value);
  }, [items, key, value]);

  return { value, setValue, results };
}
