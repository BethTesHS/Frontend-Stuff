import { FileText, Upload, X, File, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DocumentUploadProps {
  documents: File[];
  handleDocumentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeDocument: (index: number) => void;
}

export const DocumentUploadSection = ({
  documents,
  handleDocumentUpload,
  removeDocument,
}: DocumentUploadProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-purple-500" />
        Property Documents
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Upload deeds, energy certificates (EPC), or floor plans for
        verification.
      </p>

      {/* Upload Zone */}
      <div className="relative group bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-all cursor-pointer">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleDocumentUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="document-upload"
        />
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">
              Click to upload documents
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              PDF, DOCX or Images up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Uploaded Files ({documents.length})
          </p>
          <div className="grid gap-2">
            {documents.map((doc, index) => (
              <div
                key={`${doc.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                    {doc.type.includes("image") ? (
                      <ImageIcon className="w-5 h-5 text-purple-500" />
                    ) : (
                      <File className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
