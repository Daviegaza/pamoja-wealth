import { QueryClient } from "@tanstack/react-query";

/** Single app-wide query client, so logout can wipe cached chama records. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } },
});
