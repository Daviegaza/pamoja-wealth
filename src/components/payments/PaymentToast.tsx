/**
 * PaymentToast — global Socket.io listener.
 *
 * Mounted once at app root. Listens for `payment:completed` and
 * `payment:failed` events on the user's socket room and fires a Sonner toast.
 * This guarantees that even if the user closed the ContributeModal early,
 * they still see the receipt notification.
 */
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { useSocketEvent } from "@/lib/socket";
import { useGroupStore } from "@/stores/groupStore";
import { formatCurrency } from "@/lib/utils";

interface PaymentCompletedEvent {
  transactionId: string;
  groupId?: string;
  amount: number;
  mpesaReceipt: string;
  completedAt: string;
}

interface PaymentFailedEvent {
  transactionId: string;
  groupId?: string;
  reason?: string;
  amount?: number;
}

export function PaymentToast() {
  const byId = useGroupStore((s) => s.byId);

  useSocketEvent<PaymentCompletedEvent>("payment:completed", (p) => {
    if (!p) return;
    const groupName = p.groupId ? byId(p.groupId)?.name ?? "your group" : "your group";
    toast.success(`${formatCurrency(p.amount)} to ${groupName}`, {
      description: `Receipt ${p.mpesaReceipt}`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "View",
        onClick: () => {
          // Open transaction detail — uses the existing transactions route.
          window.location.href = `/transactions?ref=${encodeURIComponent(p.mpesaReceipt)}`;
        },
      },
    });
  });

  useSocketEvent<PaymentFailedEvent>("payment:failed", (p) => {
    if (!p) return;
    const groupName = p.groupId ? byId(p.groupId)?.name ?? "your group" : "your group";
    toast.error(`Payment to ${groupName} didn't go through`, {
      description: p.reason ?? "M-Pesa STK push was not confirmed.",
      icon: <XCircle className="h-4 w-4" />,
      duration: 7000,
    });
  });

  return null;
}

export default PaymentToast;
