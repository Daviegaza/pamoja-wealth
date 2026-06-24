import { AIChatWidget } from "@/components/dialogs/AIChatWidget";
import { AIInsightCard } from "@/components/common/AIInsightCard";

export default function AIAssistantPage() {
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
            insights={[
              "Your portfolio risk has decreased 4% this quarter due to increased Treasury Bill allocation.",
              "3 members have missed contributions for 2+ months — consider a friendly reminder.",
              "Loan default rate across your chamas is 2.1%, well below the platform average of 5.8%.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
