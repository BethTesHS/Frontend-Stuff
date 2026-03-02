import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  propertyImages: File[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const ImageUploadSection = ({
  propertyImages,
  handleImageUpload,
  removeImage,
}: ImageUploadProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2 text-emerald-500" />
        Property Images *
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Upload high-quality images (minimum 1 required). Recommended size:
        1200x800px.
      </p>

      {/* Dropzone Area */}
      <div className="group relative bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="property-image-upload"
        />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              PNG, JPG, or WEBP (max. 5MB each)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="pointer-events-none border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
          >
            Select Files
          </Button>
        </div>
      </div>

      {/* Image Preview Grid */}
      {propertyImages.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Selected Images ({propertyImages.length})
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {propertyImages.map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Delete Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8 rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-2 bg-white dark:bg-gray-800">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
