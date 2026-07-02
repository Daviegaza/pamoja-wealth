import { useQuery } from "@tanstack/react-query";
import { AIChatWidget } from "@/components/dialogs/AIChatWidget";
import { AIInsightCard } from "@/components/common/AIInsightCard";
import { getInsights } from "@/api/ai";

export default function AIAssistantPage() {
  const insightsQuery = useQuery({
    queryKey: ["ai", "insights"],
    queryFn: () => getInsights(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const errorMessage =
    (insightsQuery.error as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message || "AI is currently unavailable.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ask questions about your chamas, finances, and investment strategy.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIChatWidget />
        </div>
        <div className="space-y-4">
          <AIInsightCard
            insights={insightsQuery.data ?? []}
            isLoading={insightsQuery.isLoading}
            isError={insightsQuery.isError}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}
