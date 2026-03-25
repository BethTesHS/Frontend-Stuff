import { useState, useEffect } from "react";
import {
  Wand2,
  AlertCircle,
  Camera,
  Layout,
  ArrowRight,
  Loader2,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PropertyImprovementModalProps {
  property: any | null;
  open: boolean;
  onClose: () => void;
  onFix: () => void;
}

export const PropertyImprovementModal = ({
  property,
  open,
  onClose,
  onFix,
}: PropertyImprovementModalProps) => {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    if (open && property) {
      setAnalyzing(true);
      const timer = setTimeout(() => setAnalyzing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [open, property]);

  if (!property) return null;

  // --- DYNAMIC DATA CALCULATIONS ---
  const photoCount = property.images?.length || 0;
  const documentCount = property.documents?.length || 0;

  // Updated: Changed default fallback to GBP
  const currency = property.currency || "GBP";
  const currentPrice = Number(property.price) || 0;

  const marketAvg = currentPrice * 0.93;
  const priceDiffPercentage = 7;

  const recMin = currentPrice * 0.92;
  const recMax = currentPrice * 0.95;

  const simulatedCTR = photoCount < 3 ? 2.4 : photoCount < 6 ? 3.8 : 5.2;

  // Updated: Changed locale to en-GB for proper UK formatting (£)
  const formatPrice = (val: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            <DialogTitle className="text-lg font-bold dark:text-white">
              Analysis for {property.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6">
          {analyzing ? null : (
            <div className="space-y-6">
              {/* 1. THE ISSUES */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Detected Issues
                </h4>

                <div className="flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">
                    Listed at{" "}
                    <span className="font-bold">
                      {formatPrice(currentPrice)}
                    </span>
                    , which is{" "}
                    <span className="font-bold text-red-500">
                      {priceDiffPercentage}% higher
                    </span>{" "}
                    than area average ({formatPrice(marketAvg)}).
                  </p>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  {photoCount < 8 ? (
                    <>
                      <Camera className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-slate-700 dark:text-slate-300">
                        Only{" "}
                        <span className="font-bold text-amber-600">
                          {photoCount} photos
                        </span>
                        . High-performing listings in{" "}
                        {property.city || "this area"} usually have 8+.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-slate-700 dark:text-slate-300">
                        Excellent photo count ({photoCount} images).
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <TrendingDown className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">
                    Current visibility:{" "}
                    <span className="font-bold">{simulatedCTR}% CTR</span>.
                    Improving photos could boost this to 6.5%.
                  </p>
                </div>

                {documentCount === 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <Layout className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-slate-700 dark:text-slate-300">
                      Missing floor plans or legal docs. Adding these increases
                      lead quality by 20%.
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* 2. THE ACTIONS */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Recommended Strategy
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Adjust price to{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400 mx-1">
                      {formatPrice(recMin)} – {formatPrice(recMax)}
                    </span>
                  </li>

                  {photoCount < 8 && (
                    <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Add{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {8 - photoCount} more
                      </span>{" "}
                      interior photos
                    </li>
                  )}

                  <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Verify property with ownership documents
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <Button
            variant="ghost"
            className="flex-1 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Skip for now
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            onClick={onFix}
          >
            Fix Issues Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
