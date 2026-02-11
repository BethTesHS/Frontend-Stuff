
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface DropdownOption {
  to: string;
  label: string;
}

interface DropdownNavItemProps {
  icon: LucideIcon;
  label: string;
  dropdownKey: string;
  options: DropdownOption[];
  isOpen: boolean;
  onMouseEnter: (key: string) => void;
  onMouseLeave: () => void;
  iconColor?: string;
}

const DropdownNavItem = ({ 
  icon: Icon, 
  label, 
  dropdownKey, 
  options, 
  isOpen, 
  onMouseEnter, 
  onMouseLeave,
  iconColor = 'text-gray-500'
}: DropdownNavItemProps) => {
  return (
    <div className="relative" onMouseLeave={onMouseLeave}>
      <Button
        variant="ghost"
        size="sm"
        className="group flex items-center gap-1 text-blue-900 font-medium hover:text-red-600 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0 relative p-2"
        onMouseEnter={() => onMouseEnter(dropdownKey)}
      >
        <span>{label}</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border shadow-lg rounded-md z-50"
             onMouseEnter={() => onMouseEnter(dropdownKey)}
             onMouseLeave={onMouseLeave}>
          <div className={options.length > 1 ? "divide-y" : "p-0"}>
            {options.map((option) => (
              <Link
                key={option.to}
                to={option.to}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownNavItem;
