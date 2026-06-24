import { CreateChamaForm } from "@/components/forms/CreateChamaForm";
import { Building2 } from "lucide-react";

export default function CreateChamaPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient-brand shadow-glow-sm mb-4">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create a new chama</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs mx-auto">
          Set up your savings, investment or welfare group in minutes.
        </p>
      </div>
      <div className="card-hover p-6">
        <CreateChamaForm />
      </div>
    </div>
  );
}
