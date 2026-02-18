import { useState, useEffect } from 'react';
import { RoomFilters as RoomFiltersType } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROOM_TYPES, GENDER_PREFERENCES } from '@/constants/filters';

interface RoomFiltersProps {
  filters: RoomFiltersType;
  onFiltersChange: (filters: RoomFiltersType) => void;
  onClose?: () => void;
}

const RoomFilters = ({ filters, onFiltersChange, onClose }: RoomFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<RoomFiltersType>(filters);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    if (onClose) onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: RoomFiltersType = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    if (onClose) onClose();
  };

  const updateFilter = (key: keyof RoomFiltersType, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleRoomType = (roomType: string) => {
    const currentTypes = localFilters.room_type || [];
    const newTypes = currentTypes.includes(roomType)
      ? currentTypes.filter(t => t !== roomType)
      : [...currentTypes, roomType];
    
    updateFilter('room_type', newTypes.length > 0 ? newTypes : undefined);
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range (per month)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min £"
            value={localFilters.min_rent || ''}
            onChange={(e) => updateFilter('min_rent', e.target.value ? parseInt(e.target.value) : undefined)}
          />
          <Input
            type="number"
            placeholder="Max £"
            value={localFilters.max_rent || ''}
            onChange={(e) => updateFilter('max_rent', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Room Type */}
      <div className="space-y-2">
        <Label>Room Type</Label>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((type) => {
            const isSelected = localFilters.room_type?.includes(type.value);
            return (
              <div
                key={type.value}
                onClick={() => toggleRoomType(type.value)}
                className={`cursor-pointer px-3 py-1 text-sm rounded-full border transition-colors ${
                  isSelected 
                    ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {type.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Furnished */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="furnished"
          checked={localFilters.furnished === true}
          onCheckedChange={(checked) => updateFilter('furnished', checked ? true : undefined)}
        />
        <Label htmlFor="furnished">Furnished only</Label>
      </div>

      {/* Bills Included */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="bills-included"
          checked={localFilters.bills_included === true}
          onCheckedChange={(checked) => updateFilter('bills_included', checked ? true : undefined)}
        />
        <Label htmlFor="bills-included">Bills included</Label>
      </div>

      {/* Available From */}
      <div className="space-y-2">
        <Label htmlFor="available-from">Available from</Label>
        <Input
          id="available-from"
          type="date"
          value={localFilters.available_from || ''}
          onChange={(e) => updateFilter('available_from', e.target.value || undefined)}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, area, or postcode"
          value={localFilters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value || undefined)}
        />
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <Label>Preferences</Label>
        
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-muted-foreground">Gender preference</Label>
          <Select
            value={localFilters.preferences?.gender || 'any'}
            onValueChange={(value) => updateFilter('preferences', {
              ...localFilters.preferences,
              gender: value === 'any' ? undefined : value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_PREFERENCES.map((pref) => (
                <SelectItem key={pref.value} value={pref.value} className="cursor-pointer">
                  {pref.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="smoking-ok"
            checked={localFilters.preferences?.smoking === true}
            onCheckedChange={(checked) => updateFilter('preferences', {
              ...localFilters.preferences,
              smoking: checked ? true : undefined
            })}
          />
          <Label htmlFor="smoking-ok">Smoking allowed</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pets-ok"
            checked={localFilters.preferences?.pets === true}
            onCheckedChange={(checked) => updateFilter('preferences', {
              ...localFilters.preferences,
              pets: checked ? true : undefined
            })}
          />
          <Label htmlFor="pets-ok">Pets allowed</Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={handleClearFilters} className="flex-1">
          Clear All Filters
        </Button>
        <Button onClick={handleApplyFilters} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default RoomFilters;