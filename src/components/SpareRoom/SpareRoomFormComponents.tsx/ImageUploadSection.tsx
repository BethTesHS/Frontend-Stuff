import React from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  images: File[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const ImageUploadSection = ({
  images,
  handleImageUpload,
  removeImage,
}: ImageUploadProps) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-lg">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((file, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Add Photo
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload up to 10 clear photos of the room and common areas. (JPG, PNG)
        </p>
      </CardContent>
    </Card>
  );
};
