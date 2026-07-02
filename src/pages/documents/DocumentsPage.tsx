import { useRef, useState } from "react";
import { FileText, FileImage, FileSpreadsheet, File as FileIcon, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/Button";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import { formatDate } from "@/lib/utils";
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  type DocumentDTO,
} from "@/api/documents";

type DocType = DocumentDTO["type"];

const iconMap: Record<DocType, typeof FileText> = {
  pdf: FileText,
  doc: FileIcon,
  image: FileImage,
  sheet: FileSpreadsheet,
};

function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;
}

export default function DocumentsPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const documentsQuery = useQuery({
    queryKey: ["documents", { chamaId: activeChamaId ?? undefined }],
    queryFn: () => listDocuments({ chamaId: activeChamaId ?? undefined, pageSize: 100 }),
  });

  const items: DocumentDTO[] = documentsQuery.data?.items ?? [];
  const { query, setQuery, results } = useSearch(items, ["name", "uploadedByName"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 10);

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadDocument(file, activeChamaId ? { chamaId: activeChamaId } : undefined),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`"${doc.name}" uploaded successfully.`);
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Upload failed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Delete failed")),
  });

  const openPicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleDownload = async (doc: DocumentDTO) => {
    try {
      const url = await downloadDocument(doc.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Download failed"));
    }
  };

  const handleDelete = (doc: DocumentDTO) => {
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    deleteMutation.mutate(doc.id);
  };

  const isLoading = documentsQuery.isLoading;
  const isError = documentsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {items.length} file{items.length !== 1 ? "s" : ""}
            {activeChama ? ` in ${activeChama.name}` : " across all chamas"}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.txt"
        />
        <Button
          leftIcon={uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          onClick={openPicker}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search documents by name or uploader..." />

      {isLoading ? (
        <div className="card-base flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading documents...</span>
        </div>
      ) : isError ? (
        <div className="card-base p-6 text-center">
          <p className="text-sm text-red-500">Failed to load documents.</p>
          <Button className="mt-3" variant="outline" onClick={() => documentsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : paginated.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={openPicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openPicker();
          }}
          className={`card-base cursor-pointer flex flex-col items-center justify-center py-16 border-2 border-dashed transition-colors ${
            isDragging
              ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/[0.05]"
              : "border-gray-200 dark:border-white/[0.06]"
          }`}
        >
          <FileText className="h-10 w-10 text-gray-300 dark:text-white/20" />
          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">
            No documents uploaded yet — drop a file here
          </p>
          <p className="mt-1 text-xs text-gray-400">or click to select a file</p>
        </div>
      ) : (
        <div className="card-base overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
          {paginated.map((doc) => {
            const Icon = iconMap[doc.type] ?? FileIcon;
            return (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    doc.type === "pdf"
                      ? "bg-red-50 dark:bg-red-500/[0.08] text-red-500"
                      : doc.type === "image"
                      ? "bg-purple-50 dark:bg-purple-500/[0.08] text-purple-500"
                      : doc.type === "sheet"
                      ? "bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-500"
                      : "bg-blue-50 dark:bg-blue-500/[0.08] text-blue-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.type.toUpperCase()} · Uploaded by {doc.uploadedByName ?? doc.uploadedBy} · {formatDate(doc.uploadedAt)} · {(doc.sizeKb / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="rounded-lg p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-ring"
                    aria-label={`Download ${doc.name}`}
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-ring disabled:opacity-50"
                    aria-label={`Delete ${doc.name}`}
                    onClick={() => handleDelete(doc)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
