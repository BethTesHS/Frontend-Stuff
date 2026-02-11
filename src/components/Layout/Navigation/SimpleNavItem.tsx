
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SimpleNavItemProps {
  to: string;
  icon: LucideIcon;
  label?: string;
  isActive: boolean;
  iconColor?: string;
}

const SimpleNavItem = ({ to, icon: Icon, label, isActive, iconColor }: SimpleNavItemProps) => {
  const isDashboard = label?.includes('Dashboard');

  const getIconColorClass = () => {
    if (isActive) return 'text-red-600';
    if (iconColor) return iconColor;
    return 'text-blue-900';
  };

  const buttonContent = (
    <Button
      variant="ghost"
      size="sm"
      className={`group flex items-center focus:outline-none focus:ring-0 focus-visible:ring-0 text-blue-900 font-medium hover:text-red-600 transition-colors`}
    >
      {label && !isDashboard && <span>{label}</span>}
      {(!label || isDashboard) && <Icon className={`w-4 h-4 ${getIconColorClass()} group-hover:text-red-600 transition-colors ${isActive ? 'text-red-600' : ''}`} />}
    </Button>
  );

  // Show tooltip for dashboard items or when no label is visible
  if (label && !isDashboard && label !== 'Home') {
    return (
      <Link to={to}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={to}>
            {buttonContent}
          </Link>
        </TooltipTrigger>
        {label && (
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default SimpleNavItem;
