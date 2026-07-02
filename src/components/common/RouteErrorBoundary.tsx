import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page not found";
      message = "The page you're looking for doesn't exist.";
    } else if (error.status === 401 || error.status === 403) {
      title = "Access denied";
      message = "Please sign in to continue.";
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    const raw = error.message;
    if (raw.includes("Failed to fetch dynamically imported module") || raw.includes("Loading chunk")) {
      title = "Update available";
      message = "A newer version of the app is ready. Reload to continue.";
    } else {
      message = raw;
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button onClick={() => window.location.reload()} size="sm">
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reload
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm">
            <Home className="mr-1.5 h-4 w-4" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
