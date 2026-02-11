import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { usePostcodeLookup } from '@/hooks/usePostcodeLookup';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound?: (address: {
    street?: string;
    city: string;
    county: string;
  }) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export const PostcodeInput: React.FC<PostcodeInputProps> = ({
  value,
  onChange,
  onAddressFound,
  placeholder = "Enter postcode",
  className,
  label = "Postcode",
  required = false,
  error
}) => {
  const [showLookup, setShowLookup] = useState(false);
  const { lookupPostcode, loading, error: lookupError } = usePostcodeLookup();

  useEffect(() => {
    // Show lookup button when postcode looks valid (basic UK postcode pattern)
    const ukPostcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    setShowLookup(ukPostcodePattern.test(value.trim()));
  }, [value]);

  const handleLookup = async () => {
    if (!value.trim()) return;

    const result = await lookupPostcode(value.trim());
    if (result && onAddressFound) {
      onAddressFound({
        street: result.street,
        city: result.city,
        county: result.county
      });
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="postcode">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id="postcode"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder={placeholder}
            className={cn(
              className,
              (error || lookupError) && "border-destructive"
            )}
          />
        </div>
        {showLookup && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleLookup}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {(error || lookupError) && (
        <p className="text-sm text-destructive">
          {error || lookupError}
        </p>
      )}
    </div>
  );
};