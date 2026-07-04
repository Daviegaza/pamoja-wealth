import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppRouter } from "@/routes";
import { PaymentToast } from "@/components/payments/PaymentToast";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import "@/stores/transactionStore"; // Initialize cross-module transaction listeners

/**
 * Skip-to-content link for keyboard & screen-reader users.
 * Visible on first Tab press, jumps past navigation to main content.
 */
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-500/30"
    >
      Skip to main content
    </a>
  );
}

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SkipToContent />
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
