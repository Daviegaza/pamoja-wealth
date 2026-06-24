import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const can = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  return { permissions: user?.permissions ?? [], can };
}
