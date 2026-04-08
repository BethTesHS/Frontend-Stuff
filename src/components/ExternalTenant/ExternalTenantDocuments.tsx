import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Upload, 
  Loader2, 
  FolderOpen, 
  Shield, 
  Plus, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { externalTenantApi } from '@/services/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DocumentType = "tenancy_agreement" | "council_tax" | "other";

const DOC_TYPE_LABELS: Record<string, string> = {
  tenancy_agreement: 'Tenancy Agreement',
  council_tax: 'Council Tax',
  other: 'Other Document',
};

function formatSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts?: string | null): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ExternalTenantDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'tenancy_agreement' as DocumentType,
  });

  const fetchDocuments = async () => {
    try {
      const res = await externalTenantApi.getDocuments();
      if (res?.success && res.data) {
        // Handle different possible backend response structures
        const list = Array.isArray(res.data) ? res.data : res.data.documents ?? res.data.data ?? [];
        setDocuments(list);
      }
    } catch (error) {
      toast.error('Could not load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("Please select a file from your computer");

    setIsUploading(true);
    const uploadToast = toast.loading("Uploading document...");
    try {
      const res = await externalTenantApi.uploadDocument({
        title: formData.title,
        description: formData.description,
        document_type: formData.document_type,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        file_url: "#" // Replace with actual storage URL in production
      });

      if (res.success) {
        toast.success("Document uploaded successfully", {
          id: uploadToast,
          description:
            "An email notification has been sent to your landlord and the Homed admin.",
          duration: 5000,
        });
        setIsModalOpen(false);
        resetForm();
        await fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  const handleDownload = (url: string, fileName: string) => {
    if (!url || url === "#") {
      toast.info("This is a placeholder file. Real downloads require cloud storage integration.");
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({ title: '', description: '', document_type: 'tenancy_agreement' });
  };

  const handleDelete = async (doc: any) => {
    if (doc.is_admin_uploaded) {
      toast.error('Admin-uploaded documents cannot be deleted');
      return;
    }
    setDeleting((prev) => new Set([...prev, doc.id]));
    try {
      await externalTenantApi.deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting((prev) => { const s = new Set(prev); s.delete(doc.id); return s; });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
          uploaded
        </p>
        {documents.length > 0 && (
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        )}
      </div>

      {/* Main Content */}
      {documents.length === 0 ? (
        <div className="space-y-6">
          {/* Info Section: Why Homed needs these */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full h-fit">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-lg">
                  Why we need these documents?
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
                      <strong>Council Tax:</strong> Essential for proof of
                      address and local authority compliance.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section: The actual CTA */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              No documents uploaded yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Start by uploading your tenancy agreement and council tax bill.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 px-8">
              <Upload className="w-4 h-4" /> Upload Documents
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
            >
              <div className="size-11 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {doc.title}
                  </p>
                  {doc.is_admin_uploaded && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-tighter">
                      Official
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                  </span>
                  <span>•</span>
                  <span>{formatSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* {doc.file_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc.file_url, doc.file_name)}
                    className="h-9 w-9 rounded-lg"
                  >
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                    </a>
                  </Button>
                )} */}
                {!doc.is_admin_uploaded && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting.has(doc.id)}
                    onClick={() => handleDelete(doc)}
                    className="h-9 w-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 text-gray-400"
                  >
                    {deleting.has(doc.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Select Files From Computer */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(val) => {
          setIsModalOpen(val);
          if (!val) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[440px] dark:bg-gray-950 dark:border-gray-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Upload Document</DialogTitle>
            <DialogDescription>
              Select files from your device to store securely in your Homed
              profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-5 pt-2">
            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                ${
                  selectedFile
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                }
              `}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[250px] mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    File selected. Click to change.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Click to browse your computer
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG or Word docs up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="doc_type"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500"
                >
                  Category
                </Label>
                <select
                  id="doc_type"
                  className="flex h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.document_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_type: e.target.value as DocumentType,
                    })
                  }
                >
                  <option value="tenancy_agreement">Tenancy Agreement</option>
                  <option value="council_tax">Council Tax Document</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="title"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500"
                >
                  Document Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. 2026 Tenancy Agreement"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="desc"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500"
                >
                  Notes (Optional)
                </Label>
                <Textarea
                  id="desc"
                  placeholder="Anything we should know about this file?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="rounded-xl min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl shadow-lg shadow-blue-500/20"
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Complete Upload
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalTenantDocuments;