import { useAuthStore } from "@/stores/authStore";

export function useUser() {
  return useAuthStore((s) => s.user);
}
