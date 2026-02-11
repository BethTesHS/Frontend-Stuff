import { useState } from 'react';
import { postcodeApi } from '@/services/postcodeApi';

interface PostcodeData {
  postcode: string;
  street?: string;
  city: string;
  county: string;
  latitude?: number;
  longitude?: number;
}

export const usePostcodeLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupPostcode = async (postcode: string): Promise<PostcodeData | null> => {
    if (!postcode || postcode.length < 3) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await postcodeApi.lookupPostcode(postcode);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Failed to lookup postcode');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup postcode';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    lookupPostcode,
    loading,
    error,
    clearError: () => setError(null)
  };
};