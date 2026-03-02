import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Home, Building, Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { propertyApi } from "@/services/api";
import { BasicInfoSection } from "@/components/Properties/PropertyFormSubComponents/BasicInfoSec";
import { PropertySpecsSection } from "@/components/Properties/PropertyFormSubComponents/PropertSpecSec";
import { AddressInfoSection } from "@/components/Properties/PropertyFormSubComponents/AddressSec";
import { AdditionalDetailsSection } from "@/components/Properties/PropertyFormSubComponents/OtherDetails";
import { ImageUploadSection } from "@/components/Properties/PropertyFormSubComponents/ImageUploadSec";
import { PropertyFeaturesSection } from "@/components/Properties/PropertyFormSubComponents/PropertyFeatureSec";
import { DocumentUploadSection } from "@/components/Properties/PropertyFormSubComponents/DocumentUploadSec";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ListPropertyProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAgencyMode: boolean;
  onComplete?: (data: any) => void;
  defaultValues?: any;
}

interface PropertyData {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  propertySize?: number;
  landSize?: number;
  propertyType: "house" | "flat" | "bungalow" | "maisonette" | "land";
  listingType: "sale" | "rent" | "both";
  tenure: "freehold" | "leasehold";
  street: string;
  city: string;
  postcode: string;
  county: string;
  energyRating?: string;
  councilTaxBand?: string;
  yearBuilt?: number;
  features: string[];
}

const ListProperty = ({
  isOpen,
  onClose,
  user,
  isAgencyMode,
  onComplete,
  defaultValues,
}: ListPropertyProps) => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PropertyData>();

  const listingType = watch("listingType");
  const isSaleRequired = listingType === "sale" || listingType === "both";
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const commonFeatures = [
    "Garden",
    "Parking",
    "Garage",
    "Balcony",
    "Terrace",
    "Fireplace",
    "Central Heating",
    "Double Glazing",
    "Fitted Kitchen",
    "En-suite",
    "Walk-in Closet",
    "Utility Room",
    "Conservatory",
    "Swimming Pool",
  ];
  useEffect(() => {
    if (!isOpen) {
      if (defaultValues) {
        reset(defaultValues);
        setSelectedFeatures(defaultValues.features || []);
      }
    } else {
      //when opening for a new listing
      reset();
    }
  }, [isOpen, reset]);

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setSelectedFeatures((prev) => {
      if (checked) {
        if (prev.includes(feature)) return prev;
        return [...prev, feature];
      } else {
        return prev.filter((f) => f !== feature);
      }
    });
  };

  const onSubmit = async (data: PropertyData) => {
    if (propertyImages.length === 0) {
      toast.error("Please upload at least one property image");
      return;
    }

    const isDirectSubmit =
      user?.role === "agent" || user?.role === "manager" || isAgencyMode;
    const propertyDataWithFeatures = {
      ...data,
      features: selectedFeatures,
      propertyImages: propertyImages,
      documents: documents,
    };

    if (isDirectSubmit) {
      setSubmitting(true);
      try {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("price", data.price.toString());
        formData.append("bedrooms", data.bedrooms.toString());
        formData.append("bathrooms", data.bathrooms.toString());
        formData.append("receptions", data.receptions.toString());
        formData.append("propertyType", data.propertyType);
        formData.append("listingType", data.listingType);
        formData.append("tenure", data.tenure);
        formData.append("street", data.street);
        formData.append("city", data.city);
        formData.append("postcode", data.postcode);
        formData.append("county", data.county);
        formData.append("features", JSON.stringify(selectedFeatures));

        if (data.propertySize)
          formData.append("property_size", data.propertySize.toString());
        if (data.landSize)
          formData.append("land_size", data.landSize.toString());
        if (data.energyRating)
          formData.append("energy_rating", data.energyRating);
        if (data.councilTaxBand)
          formData.append("council_tax_band", data.councilTaxBand);
        if (data.yearBuilt)
          formData.append("year_built", data.yearBuilt.toString());

        propertyImages.forEach((image) => formData.append("images", image));
        documents.forEach((doc) => formData.append("documents", doc));

        await propertyApi.createProperty(formData);

        toast.success("Property listed successfully!");
        onClose();
        navigate(0); // Refresh current dashboard to show new property
      } catch (error: any) {
        toast.error(error.message || "Failed to create property listing");
      } finally {
        setSubmitting(false);
      }
    } else {
      if (onComplete) {
        onComplete(propertyDataWithFeatures);
      } else {
        // Fallback for older implementation
        onClose();
        console.error("onComplete callback missing in ListProperty component");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length)
      toast.warning("Only image files are allowed");
    setPropertyImages((prev) => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setPropertyImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") || allowedTypes.includes(file.type),
    );
    if (validFiles.length !== files.length)
      toast.warning("Only PDF, DOC, DOCX, and image files are allowed");
    setDocuments((prev) => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    const currentValues = watch();
    const draftData = {
      ...currentValues,
      features: selectedFeatures,
      isDraft: true,
      updatedAt: new Date().toISOString(),
    };

    setIsSavingDraft(true);
    try {
      const response = await propertyApi.saveDraft(draftData);
      if (response.success) {
        toast.success("Progress saved! You can finish this later.");
        onClose();
      } else {
        toast.error("Failed to save draft");
      }
    } catch (error: any) {
      toast.error(error.message || "Error saving draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !submitting && !open && onClose()}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-white dark:bg-slate-950">
        <DialogHeader className="p-6 border-b sticky top-0 z-50 bg-white dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center transition-colors">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                List Property
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Provide comprehensive information about the property
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white dark:bg-slate-950">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <BasicInfoSection
              register={register}
              errors={errors}
              setValue={setValue}
            />
            <PropertySpecsSection
              register={register}
              errors={errors}
              setValue={setValue}
            />
            <AddressInfoSection
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
            <AdditionalDetailsSection
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              isSaleRequired={isSaleRequired}
            />
            <ImageUploadSection
              propertyImages={propertyImages}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
            />
            <PropertyFeaturesSection
              commonFeatures={commonFeatures}
              selectedFeatures={selectedFeatures}
              handleFeatureChange={handleFeatureChange}
            />
            <DocumentUploadSection
              documents={documents}
              handleDocumentUpload={handleDocumentUpload}
              removeDocument={removeDocument}
            />

            <div className="pt-4 bottom-0 bg-white dark:bg-slate-950 border-t dark:border-slate-800 pb-6 px-6 sm:px-8 mt-6">
              <div className="flex flex-col items-center gap-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg py-6 text-lg font-semibold transition-all duration-200 active:scale-[0.98]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Listing Property...</span>
                    </div>
                  ) : user?.role === "agent" ||
                    user?.role === "manager" ||
                    isAgencyMode ? (
                    "Submit Property Listing"
                  ) : (
                    "Continue to Listing Options"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={submitting || isSavingDraft}
                  className="w-3/4 sm:w-1/2 py-4border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-400 dark:bg-transparent dark:hover:bg-blue-900/30 dark:hover:text-blue-300 font-medium transition-all"
                >
                  {isSavingDraft ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save as Draft & Exit
                </Button>

                <p className="text-[11px] text-muted-foreground">
                  You can resume this listing anytime from your dashboard.
                </p>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListProperty;