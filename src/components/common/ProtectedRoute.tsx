import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  // Wait for Zustand persist to rehydrate from localStorage before checking auth.
  // Without this, every page reload briefly has isAuthenticated=false and
  // redirects to /login before rehydration completes.
  useEffect(() => {
    const check = () => {
      const state = useAuthStore.getState();
      // _hasHydrated is set by onRehydrateStorage callback
      if ((state as any)._hasHydrated) {
        setReady(true);
        return;
      }
      // If already authenticated (e.g., from a fresh login, not reload), ready immediately
      if (state.isAuthenticated) {
        setReady(true);
        return;
      }
      // Poll until hydrated
      const timer = setTimeout(check, 50);
      return () => clearTimeout(timer);
    };
    check();
  }, []);

  // Still rehydrating — show a loading skeleton, not a redirect
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md p-8">
          <SkeletonLoader rows={4} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
