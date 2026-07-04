import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppRouter } from "@/routes";
import { PaymentToast } from "@/components/payments/PaymentToast";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import "@/stores/transactionStore"; // Initialize cross-module transaction listeners

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <OfflineBanner />
        <AppRouter />
        <ToastProvider />
        <PaymentToast />
        <PaywallModal />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
