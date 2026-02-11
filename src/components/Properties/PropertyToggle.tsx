import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';

interface PropertyToggleProps {
  propertyId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  disabled?: boolean;
}

export const PropertyToggle = ({
  propertyId,
  currentStatus,
  onStatusChange,
  disabled = false
}: PropertyToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  // Only allow toggling for active or withdrawn properties
  const canToggle = ['active', 'withdrawn'].includes(localStatus);
  const isPublic = localStatus === 'active';

  const handleToggle = async (checked: boolean) => {
    const newStatus = checked ? 'active' : 'withdrawn';
    const previousStatus = localStatus;

    // Optimistic update
    setLocalStatus(newStatus);
    setIsUpdating(true);

    try {
      const response = await propertyApi.updatePropertyStatus(
        propertyId.toString(),
        newStatus
      );

      if (response.success) {
        toast.success(
          checked
            ? 'Property is now public and visible in listings'
            : 'Property has been unlisted and hidden from public view'
        );
        onStatusChange?.(newStatus);
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalStatus(previousStatus);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update property visibility'
      );
      console.error('Error updating property status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // If property cannot be toggled (e.g., sold, let, etc.), show informational text
  if (!canToggle) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        Cannot change visibility for {localStatus} properties
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={disabled || isUpdating}
        aria-label="Toggle property visibility"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
        {isPublic ? (
          <>
            <Eye className="w-4 h-4" />
            Public
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            Unlisted
          </>
        )}
      </span>
    </div>
  );
};
