import { useState, useEffect } from 'react';
import { SearchFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PostcodeInput } from '@/components/ui/postcode-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface PropertyFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose?: () => void;
}

const PropertyFilters = ({ filters, onFiltersChange, onClose }: PropertyFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Sync with parent filters when they change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    if (onClose) onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onFiltersChange({});
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <PostcodeInput
          value={localFilters.location || ''}
          onChange={(value) => setLocalFilters({ ...localFilters, location: value })}
          onAddressFound={(address) => {
            setLocalFilters({ ...localFilters, location: address.city });
          }}
          label="Location"
          placeholder="Enter postcode, city, or area"
          className="mt-1"
        />
      </div>

      {/* Price Range */}
      <div>
        <Label>Price Range</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input
            placeholder="Min price"
            type="number"
            value={localFilters.minPrice || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) || undefined })}
          />
          <Input
            placeholder="Max price"
            type="number"
            value={localFilters.maxPrice || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) || undefined })}
          />
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <Label>Listing Type</Label>
        <Select 
          value={localFilters.listingType || ''} 
          onValueChange={(value) => setLocalFilters({ ...localFilters, listingType: value as 'sale' | 'rent' })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sale or Rent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale" className="cursor-pointer">For Sale</SelectItem>
            <SelectItem value="rent" className="cursor-pointer">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div>
        <Label>Minimum Bedrooms</Label>
        <Select 
          value={localFilters.bedrooms?.toString() || ''} 
          onValueChange={(value) => setLocalFilters({ ...localFilters, bedrooms: Number(value) || undefined })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" className="cursor-pointer">1+</SelectItem>
            <SelectItem value="2" className="cursor-pointer">2+</SelectItem>
            <SelectItem value="3" className="cursor-pointer">3+</SelectItem>
            <SelectItem value="4" className="cursor-pointer">4+</SelectItem>
            <SelectItem value="5" className="cursor-pointer">5+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-base font-medium">Property Type</Label>
        <div className="space-y-2 mt-2">
          {['house', 'flat', 'bungalow', 'maisonette'].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={localFilters.propertyType?.includes(type) || false}
                onCheckedChange={(checked) => {
                  const current = localFilters.propertyType || [];
                  if (checked) {
                    setLocalFilters({ 
                      ...localFilters, 
                      propertyType: [...current, type] 
                    });
                  } else {
                    setLocalFilters({ 
                      ...localFilters, 
                      propertyType: current.filter(t => t !== type) 
                    });
                  }
                }}
              />
              <Label htmlFor={type} className="capitalize cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Passport Rating */}
      <div>
        <Label>Minimum Passport Rating</Label>
        <div className="mt-2">
          <Slider
            value={[localFilters.passportRating || 0]}
            onValueChange={(value) => setLocalFilters({ ...localFilters, passportRating: value[0] })}
            max={10}
            min={0}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>{localFilters.passportRating || 0}/10</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="outline" className="w-full">
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default PropertyFilters;