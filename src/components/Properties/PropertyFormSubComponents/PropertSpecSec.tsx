import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings, Maximize, Map as MapIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertySpecsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
}

export const PropertySpecsSection = ({
  register,
  errors,
  setValue,
}: PropertySpecsProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-purple-500" />
        Property Specifications
      </h3>

      {/* Room Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="bedrooms"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Bedrooms *
          </Label>
          <Input
            id="bedrooms"
            type="number"
            {...register("bedrooms", {
              required: "Required",
              valueAsNumber: true,
            })}
            placeholder="e.g., 3"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          {errors.bedrooms && (
            <p className="text-xs text-red-500">
              {errors.bedrooms.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="bathrooms"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Bathrooms *
          </Label>
          <Input
            id="bathrooms"
            type="number"
            {...register("bathrooms", {
              required: "Required",
              valueAsNumber: true,
            })}
            placeholder="e.g., 2"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          {errors.bathrooms && (
            <p className="text-xs text-red-500">
              {errors.bathrooms.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="receptions"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Reception Rooms *
          </Label>
          <Input
            id="receptions"
            type="number"
            {...register("receptions", {
              required: "Required",
              valueAsNumber: true,
            })}
            placeholder="e.g., 1"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          {errors.receptions && (
            <p className="text-xs text-red-500">
              {errors.receptions.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label
            htmlFor="propertySize"
            className="text-gray-700 dark:text-gray-300 font-medium flex items-center"
          >
            <Maximize className="w-4 h-4 mr-1" /> Property Size (sq ft)
          </Label>
          <Input
            id="propertySize"
            type="number"
            {...register("propertySize", { valueAsNumber: true })}
            placeholder="e.g., 1200"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="landSize"
            className="text-gray-700 dark:text-gray-300 font-medium flex items-center"
          >
            <MapIcon className="w-4 h-4 mr-1" /> Land Size (sq ft / acres)
          </Label>
          <Input
            id="landSize"
            type="number"
            {...register("landSize", { valueAsNumber: true })}
            placeholder="e.g., 5000"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Types Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Property Type *
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("propertyType", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="bungalow">Bungalow</SelectItem>
              <SelectItem value="maisonette">Maisonette</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          {errors.propertyType && (
            <p className="text-xs text-red-500">Property type is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Listing Type *
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("listingType", value, { shouldValidate: true })
            }
          >
            <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="both">Both Sale & Rent</SelectItem>
            </SelectContent>
          </Select>
          {errors.listingType && (
            <p className="text-xs text-red-500">Listing type is required</p>
          )}
        </div>
      </div>
    </div>
  );
};
