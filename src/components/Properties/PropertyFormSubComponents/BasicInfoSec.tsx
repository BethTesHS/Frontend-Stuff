import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the interface for the props
interface BasicInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
}

export const BasicInfoSection = ({
  register,
  errors,
  setValue,
}: BasicInfoProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-500" />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Title */}
        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Property Title *
          </Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="e.g., Beautiful 3-bedroom house"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">
              {errors.title.message as string}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label
            htmlFor="price"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Price (£) *
          </Label>
          <Input
            id="price"
            type="number"
            {...register("price", { required: "Price is required" })}
            placeholder="e.g., 450000"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {errors.price && (
            <p className="text-xs text-red-500 mt-1">
              {errors.price.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 space-y-2">
        <Label
          htmlFor="description"
          className="text-gray-700 dark:text-gray-300 font-medium"
        >
          Description *
        </Label>
        <Textarea
          id="description"
          {...register("description", { required: "Description is required" })}
          placeholder="Describe the property features, location benefits, etc..."
          rows={5}
          className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">
            {errors.description.message as string}
          </p>
        )}
      </div>
    </div>
  );
};
