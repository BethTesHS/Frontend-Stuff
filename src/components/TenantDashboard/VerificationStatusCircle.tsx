import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationStatusCircleProps {
  isVerified: boolean;
  isPending?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const VerificationStatusCircle = ({
  isVerified,
  isPending = false,
  size = "md",
  showLabel = true
}: VerificationStatusCircleProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const getStatus = () => {
    if (isVerified) {
      return {
        icon: CheckCircle2,
        color: "text-green-600 dark:text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        label: "Verified",
        tooltip: "Your tenancy has been verified by our team",
        badgeVariant: "default" as const
      };
    }

    if (isPending) {
      return {
        icon: Clock,
        color: "text-yellow-600 dark:text-yellow-500",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        label: "Pending",
        tooltip: "Your verification is pending review",
        badgeVariant: "secondary" as const
      };
    }

    return {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      label: "Not Verified",
      tooltip: "Please complete your tenancy verification to access all features",
      badgeVariant: "destructive" as const
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <div className={`flex items-center justify-center ${sizeClasses[size]} ${status.bgColor} rounded-full`}>
              <Icon className={`${sizeClasses[size]} ${status.color}`} />
            </div>
            {showLabel && (
              <Badge variant={status.badgeVariant} className="text-xs">
                {status.label}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{status.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationStatusCircle;
