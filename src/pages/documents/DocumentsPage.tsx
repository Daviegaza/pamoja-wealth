import { useRef } from "react";
import { FileText, FileImage, FileSpreadsheet, File as FileIcon, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { getMockDatabase } from "@/mock";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import { formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/types";

const iconMap: Record<DocumentItem["type"], typeof FileText> = {
  pdf: FileText, doc: FileIcon, image: FileImage, sheet: FileSpreadsheet,
};

const { documents } = getMockDatabase();

export default function DocumentsPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results } = useSearch(documents, ["name", "uploadedBy"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 10);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`"${file.name}" uploaded successfully.`);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{documents.length} shared files{activeChama ? ` in ${activeChama.name}` : " across all chamas"}</p>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
        <Button leftIcon={<Upload className="h-4 w-4" />} onClick={handleUpload}>Upload Document</Button>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search documents..." />

      {paginated.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="Upload your first document." actionLabel="Upload Document" onAction={() => fileInputRef.current?.click()} />
      ) : (
        <div className="card-base overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
          {paginated.map((doc) => {
            const Icon = iconMap[doc.type];
            return (
              <div key={doc.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">Uploaded by {doc.uploadedBy} · {formatDate(doc.uploadedAt)} · {(doc.sizeKb / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  className="rounded-lg p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => toast.success(`Downloading ${doc.name}...`)}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
