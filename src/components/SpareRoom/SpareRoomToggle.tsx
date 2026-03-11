import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { spareRoomApi } from '@/services/spareRoomApi';
import { toast } from 'sonner';

interface RoomToggleProps {
  roomId: number;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  disabled?: boolean;
}

export const RoomToggle = ({
  roomId,
  currentStatus,
  onStatusChange,
  disabled = false
}: RoomToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  // Define which statuses allow visibility toggling
  const canToggle = ['active', 'inactive'].includes(localStatus);
  const isPublic = localStatus === 'active';

  const handleToggle = async (checked: boolean) => {
    const newStatus = checked ? 'active' : 'inactive';
    const previousStatus = localStatus;

    // Optimistic UI update
    setLocalStatus(newStatus);
    setIsUpdating(true);

    try {
      await spareRoomApi.updateRoomStatus(roomId, newStatus);
      toast.success(checked ? 'Room is now public' : 'Room is now private');
      onStatusChange?.(newStatus);
    } catch (error: any) {
      // Revert on failure
      setLocalStatus(previousStatus);
      toast.error(error.message || 'Failed to update room visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!canToggle && localStatus !== 'rented') {
    return (
      <div className="text-xs text-muted-foreground italic">
        Status: {localStatus}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={disabled || isUpdating || localStatus === 'rented'}
      />
      <span className="text-xs font-medium flex items-center gap-1">
        {isPublic ? (
          <><Eye className="w-3 h-3" /> Public</>
        ) : (
          <><EyeOff className="w-3 h-3" /> Private</>
        )}
      </span>
    </div>
  );
};