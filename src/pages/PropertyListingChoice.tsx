import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { propertyApi } from "@/services/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Shield,
  Clock,
  Zap,
  Trophy,
  Target,
  Users,
  Heart,
  Loader2,
} from "lucide-react";

interface PropertyListingChoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  propertyData: any;
  onSelectAgentMode: (data: any) => void;
}

const PropertyListingChoice = ({
  isOpen,
  onClose,
  onBack,
  propertyData,
  onSelectAgentMode,
}: PropertyListingChoiceProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!propertyData) return null;

  const handleSelfManagement = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Data mapping from original logic
      formData.append("title", propertyData.title);
      formData.append("description", propertyData.description);
      formData.append("price", propertyData.price.toString());
      formData.append("bedrooms", propertyData.bedrooms.toString());
      formData.append("bathrooms", propertyData.bathrooms.toString());
      formData.append("receptions", propertyData.receptions.toString());
      formData.append("propertyType", propertyData.propertyType);
      formData.append("listingType", propertyData.listingType);
      formData.append("street", propertyData.street);
      formData.append("city", propertyData.city);
      formData.append("postcode", propertyData.postcode);
      formData.append("county", propertyData.county);

      if (propertyData.tenure) formData.append("tenure", propertyData.tenure);
      if (propertyData.propertySize)
        formData.append("property_size", propertyData.propertySize.toString());

      if (propertyData.features) {
        formData.append("features", JSON.stringify(propertyData.features));
      }

      if (propertyData.propertyImages) {
        propertyData.propertyImages.forEach((image: any) =>
          formData.append("images", image),
        );
      }

      formData.append("management_type", "self");

      const response = await propertyApi.createProperty(formData);

      if (response.success) {
        toast.success("Property listed successfully!");
        onClose();
        navigate(0);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to list property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-white dark:bg-slate-950 shadow-2xl">
        {/* Custom Header with Back Arrow Only */}
        <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
          <button
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-semibold">Back to details</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
          <div className="relative p-6 md:p-10">
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
              </div>
            )}

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 transition-colors">
                <Building className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                Listing Options
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Select how you would like to manage the listing for your{" "}
                {propertyData.bedrooms} bedroom {propertyData.propertyType}.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mb-10">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                {[
                  { label: "Price", value: `£${propertyData.price}` },
                  { label: "Type", value: propertyData.propertyType },
                  { label: "Beds", value: propertyData.bedrooms },
                  { label: "Location", value: propertyData.city },
                  { label: "Listing", value: propertyData.listingType },
                  { label: "Status", value: "Ready" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                      {item.value}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-semibold tracking-wider mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Self-Service Card */}
              <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Zap className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Self-Service
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Manage everything yourself using our comprehensive landlord
                  toolkit.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: DollarSign, text: "No commission fees" },
                    { icon: Target, text: "Direct communication" },
                    { icon: Clock, text: "Instant activation" },
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center text-xs text-slate-600 dark:text-slate-300"
                    >
                      <feat.icon className="w-3.5 h-3.5 mr-3 text-slate-400" />
                      {feat.text}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleSelfManagement}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition-all"
                >
                  Select Self-Service
                </Button>
              </div>

              {/* Agent-Assisted Card */}
              <div className="group relative bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 transition-all shadow-sm">
                <div className="absolute -top-3 right-6 bg-blue-600 text-[10px] text-white font-bold px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-200 dark:shadow-none">
                  Recommended
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-5">
                  <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Agent-Assisted
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Professional expertise for maximum results and stress-free
                  management.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: Shield, text: "Expert marketing strategy" },
                    { icon: Users, text: "Tenant screening" },
                    { icon: Heart, text: "Full management" },
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center text-xs text-slate-600 dark:text-slate-300"
                    >
                      <feat.icon className="w-3.5 h-3.5 mr-3 text-blue-500/70" />
                      {feat.text}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => {
                    onSelectAgentMode(propertyData);
                    onClose();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  Choose an Agent <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                Need help deciding? Our team is available for a free
                consultation.
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate("/contact")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                View Comparison Guide
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyListingChoice;
