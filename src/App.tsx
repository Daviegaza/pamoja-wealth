import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AppRouter } from "@/routes";
import "@/stores/transactionStore"; // Initialize cross-module transaction listeners

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppRouter />
        <ToastProvider />
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
