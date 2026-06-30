import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppRouter } from "@/routes";
import { PaymentToast } from "@/components/payments/PaymentToast";
import "@/stores/transactionStore"; // Initialize cross-module transaction listeners

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppRouter />
        <ToastProvider />
        <PaymentToast />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
