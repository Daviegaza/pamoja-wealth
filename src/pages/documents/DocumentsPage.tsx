import { useRef, useState } from "react";
import { FileText, FileImage, FileSpreadsheet, File as FileIcon, Upload, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { getMockDatabase } from "@/mock";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/dialogs/Modal";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import type { DocumentItem } from "@/types";

const iconMap: Record<DocumentItem["type"], typeof FileText> = {
  pdf: FileText, doc: FileIcon, image: FileImage, sheet: FileSpreadsheet,
};

const typeFromName = (name: string): DocumentItem["type"] => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "gif" || ext === "webp") return "image";
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return "sheet";
  return "doc";
};

export default function DocumentsPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge mock documents with user-uploaded ones
  const [uploadedDocs, setUploadedDocs] = useState<DocumentItem[]>([]);
  const allDocs = [...uploadedDocs, ...getMockDatabase().documents];
  const { query, setQuery, results } = useSearch(allDocs, ["name", "uploadedBy"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 10);

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: typeFromName(file.name),
      sizeKb: Math.round(file.size / 1024),
      uploadedBy: user?.fullName ?? "You",
      uploadedAt: new Date().toISOString(),
      url: "#",
    };
    setUploadedDocs((prev) => [newDoc, ...prev]);
    toast.success(`"${file.name}" uploaded successfully.`);
    e.target.value = "";
  };

  const handleDownload = (doc: DocumentItem) => {
    // Generate a downloadable text file with document metadata
    const content = [
      `Document: ${doc.name}`,
      `Type: ${doc.type.toUpperCase()}`,
      `Size: ${(doc.sizeKb / 1024).toFixed(1)} MB`,
      `Uploaded by: ${doc.uploadedBy}`,
      `Date: ${new Date(doc.uploadedAt).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`,
      ``,
      `— Pamoja Wealth`,
      `This is a demo document. Real file storage requires backend integration.`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name.replace(/\.[^.]+$/, "") + "_info.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${doc.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {allDocs.length} file{allDocs.length !== 1 ? "s" : ""}{activeChama ? ` in ${activeChama.name}` : " across all chamas"}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.txt"
        />
        <Button leftIcon={<Upload className="h-4 w-4" />} onClick={handleUpload}>
          Upload Document
        </Button>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search documents by name or uploader..." />

      {paginated.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents"
          description="Upload your first document or adjust your search."
          actionLabel="Upload Document"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="card-base overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
          {paginated.map((doc) => {
            const Icon = iconMap[doc.type];
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
                    {doc.type.toUpperCase()} · Uploaded by {doc.uploadedBy} · {formatDate(doc.uploadedAt)} · {(doc.sizeKb / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="rounded-lg p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-ring"
                    aria-label={`Preview ${doc.name}`}
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-ring"
                    aria-label={`Download ${doc.name}`}
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      {/* Document Preview Modal */}
      <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc?.name} size="lg">
        {previewDoc && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Type</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{previewDoc.type.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Size</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{(previewDoc.sizeKb / 1024).toFixed(1)} MB</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Uploaded by</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{previewDoc.uploadedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Date</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formatDate(previewDoc.uploadedAt)}</p>
              </div>
            </div>
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] p-12 text-center">
              {previewDoc.type === "image" ? (
                <div className="space-y-2">
                  <FileImage className="h-12 w-12 mx-auto text-purple-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Image preview not available in demo mode.</p>
                </div>
              ) : previewDoc.type === "pdf" ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-red-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">PDF preview requires backend document rendering.</p>
                  <p className="text-xs text-gray-400">In production, PDFs will be rendered with a built-in viewer.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileIcon className="h-12 w-12 mx-auto text-blue-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Document preview not available in demo mode.</p>
                </div>
              )}
            </div>
            <Button className="w-full" variant="outline" onClick={() => handleDownload(previewDoc)} leftIcon={<Download className="h-4 w-4" />}>
              Download {previewDoc.name}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
