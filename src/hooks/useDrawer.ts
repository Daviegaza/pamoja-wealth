import { useUIStore } from "@/stores/uiStore";

export function useDrawer(id: string) {
  const { activeDrawer, openDrawer, closeDrawer } = useUIStore();
  return { isOpen: activeDrawer === id, open: () => openDrawer(id), close: closeDrawer };
}
