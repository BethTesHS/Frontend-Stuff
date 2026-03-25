import { useState, useEffect } from "react";
import {
  BarChart2,
  Info,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  Zap,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { propertyApi } from "@/services/api";
import { toast } from "sonner";

interface MarketComparisonModalProps {
  open: boolean;
  onClose: () => void;
  onAction: (type: "boost" | "improve", property: any) => void;
  property: any | null;
}

export const MarketComparisonModal = ({
  open,
  onClose,
  onAction,
  property,
}: MarketComparisonModalProps) => {
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<any | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!property?.id) return;

      setLoading(true);
      try {
          // const res = await propertyApi.getPropertyMarketComparison(property.id);
          await new Promise((resolve) => setTimeout(resolve, 1000)); 

          const mockData = {
            success: true,
            data: {
              avgPrice: property.price * 0.95,
              avgRent: property.price * 1.05,
              marketTrend: "increasing",
              similarPropertiesCount: 12,
            },
          };
          if (mockData.success) { 
            setComparisonData({
              area_name: "Downtown",
              comparable_count: mockData.data.similarPropertiesCount,
              metrics: {
                impressions: {
                  current: Math.floor(Math.random() * 1000) + 500,
                  market_avg: Math.floor(Math.random() * 1000) + 500,
                },
                views: {
                  current: Math.floor(Math.random() * 200) + 50,
                  market_avg: Math.floor(Math.random() * 200) + 50,
                },
                enquiries: {
                  current: Math.floor(Math.random() * 20) + 5,
                  market_avg: Math.floor(Math.random() * 20) + 5,
                },
              },
            });
        }
      } catch (err) {
        toast.error("Could not fetch market data");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (open && property) {
      fetchMarketData();
    } else {
      setComparisonData(null);
    }
  }, [open, property]);

  const getStatus = (current: number, avg: number) => {
    if (avg === 0)
      return {
        label: "New Market",
        color: "bg-blue-100 text-blue-700",
        icon: Minus,
      };
    const diff = ((current - avg) / avg) * 100;
    if (diff > 5)
      return {
        label: "Above Market",
        color: "bg-green-100 text-green-700",
        icon: TrendingUp,
      };
    if (diff < -5)
      return {
        label: "Below Market",
        color: "bg-red-100 text-red-700",
        icon: TrendingDown,
      };
    return {
      label: "On Par",
      color: "bg-amber-100 text-amber-700",
      icon: Minus,
    };
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="px-6 py-4 border-b dark:border-gray-800">
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="text-blue-600" size={20} />
            Market Analysis:{" "}
            <span className="text-sm font-normal text-muted-foreground truncate max-w-[400px]">
              {property?.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? null : comparisonData ? (
            <div className="space-y-6">
              {/* Context Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-gray-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Local Benchmark
                </p>
                <p className="font-bold text-slate-800 dark:text-gray-100">
                  {comparisonData.area_name}
                </p>
                <p className="text-xs text-slate-500">
                  Based on {comparisonData.comparable_count} similar listings
                </p>
              </div>

              {/* Metrics List */}
              {["impressions", "views", "enquiries"].map((key) => {
                const metric = comparisonData.metrics[key];
                const status = getStatus(metric.current, metric.market_avg);
                const progress =
                  metric.market_avg > 0
                    ? Math.min((metric.current / metric.market_avg) * 100, 100)
                    : 0;

                return (
                  <div
                    key={key}
                    className="space-y-2 animate-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold capitalize text-slate-700 dark:text-slate-300">
                        {key}
                      </label>
                      <Badge
                        className={`${status.color} border-none text-[10px] font-bold px-2 py-0.5`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-white dark:bg-gray-800/40 p-2 rounded-lg border border-slate-100 dark:border-gray-800">
                      <div>
                        <p className="text-slate-400 text-[9px] uppercase font-bold">
                          Your Performance
                        </p>
                        <p className="font-black text-lg">
                          {metric.current.toLocaleString()}
                        </p>
                      </div>
                      <div className="border-l border-slate-100 dark:border-gray-800 pl-4">
                        <p className="text-slate-400 text-[9px] uppercase font-bold">
                          Area Average
                        </p>
                        <p className="font-bold text-lg text-slate-400">
                          {metric.market_avg.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={progress}
                      className="h-1.5 bg-slate-100 dark:bg-gray-800"
                    />
                  </div>
                );
              })}

              {/* Dynamic Insight */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex gap-3 border border-amber-100 dark:border-amber-900/30">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  Your <span className="font-bold">enquiries</span> are{" "}
                  {comparisonData.metrics.enquiries.current <
                  comparisonData.metrics.enquiries.market_avg
                    ? "lagging"
                    : "exceeding"}{" "}
                  the market average. Consider a price adjustment or boosting to
                  increase visibility.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t dark:border-gray-800 grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-gray-900">
          <Button
            variant="outline"
            className="gap-2 font-bold"
            onClick={() => onAction("improve", property)}
            disabled={loading}
          >
            <Wand2 size={14} className="text-blue-600" /> Improve
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-lg shadow-blue-200 dark:shadow-none"
            onClick={() => onAction("boost", property)}
            disabled={loading}
          >
            <Zap size={14} fill="currentColor" /> Boost Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
