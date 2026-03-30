import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Loader2,
  FolderOpen,
  Shield,
  Info,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { externalTenantApi } from "@/services/api";
import { toast } from "sonner";

const DOC_TYPE_LABELS: Record<string, string> = {
  tenancy_agreement: "Tenancy Agreement",
  council_tax: "Council Tax",
  inspection_report: "Inspection Report",
  notice: "Notice",
  other: "Document",
};

function formatSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts?: string | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ExternalTenantDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDocs = useCallback(async () => {
    try {
      const res = await externalTenantApi.getDocuments();
      if (res?.success && res.data) {
        // Handle different possible API structures
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data.documents ?? res.data.data ?? []);

        setDocuments(list);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Could not load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleDelete = async (doc: any) => {
    if (doc.is_admin_uploaded) {
      toast.error("Admin-uploaded documents cannot be deleted");
      return;
    }
    setDeleting((prev) => new Set([...prev, doc.id]));
    try {
      await externalTenantApi.deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document removed");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleting((prev) => {
        const s = new Set(prev);
        s.delete(doc.id);
        return s;
      });
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      setIsModalOpen(false);
      await fetchDocs();

      toast.success("Documents uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Your Documents
        </h2>
        {documents.length > 0 && (
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Upload className="w-4 h-4" /> Upload New
          </Button>
        )}
      </div>

      {/* CRITICAL: This block only shows if documents.length is 0. 
         Once fetchDocs() updates the state with the new list, 
         this section will automatically disappear.
      */}
      {documents.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full h-fit">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-lg">
                  Why we need your documents
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed mb-4">
                  Homed requires these documents to verify your tenancy status
                  and ensure all council-related services are correctly
                  allocated to your address.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Tenancy Agreement:</strong> Validates your legal
                      occupancy and rent terms.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Council Tax:</strong> Required for address
                      verification and local compliance.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              No documents yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Please upload your Tenancy Agreement and Council Tax bill to
              proceed.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 px-8">
              <Upload className="w-4 h-4" /> Upload Documents
            </Button>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                      {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{formatDate(doc.created_at)}</span>
                  {doc.file_size && <span>• {formatSize(doc.file_size)}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                {!doc.is_admin_uploaded && (
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal remains the same but calls the handleFileUpload above */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-950 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold">Upload Documents</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">
                  Tenancy Agreement
                </label>
                <input
                  type="file"
                  required
                  className="w-full text-sm border p-2 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">
                  Council Tax Bill
                </label>
                <input
                  type="file"
                  required
                  className="w-full text-sm border p-2 rounded-lg"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  "Upload Documents"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalTenantDocuments;
