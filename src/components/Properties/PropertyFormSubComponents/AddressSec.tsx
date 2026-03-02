import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { PostcodeInput } from "@/components/ui/postcode-input";

interface AddressInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export const AddressInfoSection = ({
  register,
  errors,
  setValue,
  watch,
}: AddressInfoProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-teal-500" />
        Address Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Street Address */}
        <div className="space-y-2">
          <Label
            htmlFor="street"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            Street Address *
          </Label>
          <Input
            id="street"
            {...register("street", { required: "Street address is required" })}
            placeholder="e.g., 123 Oak Avenue"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
          {errors.street && (
            <p className="text-xs text-red-500">
              {errors.street.message as string}
            </p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label
            htmlFor="city"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            City *
          </Label>
          <Input
            id="city"
            {...register("city", { required: "City is required" })}
            placeholder="e.g., Manchester"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
          {errors.city && (
            <p className="text-xs text-red-500">
              {errors.city.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* County */}
        <div className="space-y-2">
          <Label
            htmlFor="county"
            className="text-gray-700 dark:text-gray-300 font-medium"
          >
            County *
          </Label>
          <Input
            id="county"
            {...register("county", { required: "County is required" })}
            placeholder="e.g., Greater Manchester"
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
          {errors.county && (
            <p className="text-xs text-red-500">
              {errors.county.message as string}
            </p>
          )}
        </div>

        {/* Postcode Input - Integrated with your custom component */}
        <div className="space-y-2">
          <PostcodeInput
            value={watch("postcode") || ""}
            onChange={(value) =>
              setValue("postcode", value, { shouldValidate: true })
            }
            onAddressFound={(address) => {
              if (address.street)
                setValue("street", address.street, { shouldValidate: true });
              if (address.city)
                setValue("city", address.city, { shouldValidate: true });
              if (address.county)
                setValue("county", address.county, { shouldValidate: true });
            }}
            label="Postcode"
            required
            error={errors.postcode?.message as string}
            // Passing class to match our dashboard theme
            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>
    </div>
  );
};
