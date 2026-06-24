import { useUIStore } from "@/stores/uiStore";

export function useModal(id: string) {
  const { activeModal, openModal, closeModal } = useUIStore();
  return { isOpen: activeModal === id, open: () => openModal(id), close: closeModal };
}
