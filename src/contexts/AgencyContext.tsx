import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAgencySlug, isAgencySubdomain } from '@/utils/subdomain';
import { toast } from 'sonner';
import { agencyApi } from '@/services/agencyApi';

interface Agency {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

interface AgencyContextType {
  agency: Agency | null;
  isAgencyMode: boolean;
  loading: boolean;
  error: string | null;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};

interface AgencyProviderProps {
  children: ReactNode;
}

export const AgencyProvider: React.FC<AgencyProviderProps> = ({ children }) => {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgencyMode] = useState(isAgencySubdomain());
  const mountedRef = React.useRef(true);

  useEffect(() => {
    const loadAgencyData = async () => {
      if (!isAgencyMode) {
        if (mountedRef.current) {
          setLoading(false);
        }
        return;
      }

      // Priority 1: If user is authenticated, get the logged-in agency's profile
      const agencyToken = localStorage.getItem('agencyToken');
      if (agencyToken) {
        try {
          console.log('AgencyContext: Found agency token, fetching authenticated agency profile');
          if (mountedRef.current) {
            setError(null);
          }
          
          // Use the authenticated profile endpoint to get the logged-in agency's data
          const agencyData = await agencyApi.getProfile();
          console.log('AgencyContext: Loaded authenticated agency profile:', agencyData);
          
          if (mountedRef.current) {
            setAgency(agencyData);
            setLoading(false);
          }
          return;
        } catch (err: any) {
          console.error('AgencyContext: Failed to load authenticated agency profile:', err);
          
          // If token is invalid, clear it and fall through to public lookup
          if (err.message?.includes('Authentication failed') || err.message?.includes('401')) {
            localStorage.removeItem('agencyToken');
            localStorage.removeItem('agencyData');
            localStorage.removeItem('user');
          }
        }
      }

      // Priority 2: Check if we have complete agency data from login as fallback
      const storedAgencyData = localStorage.getItem('agencyData');
      if (storedAgencyData) {
        try {
          const agencyData = JSON.parse(storedAgencyData);
          console.log('AgencyContext: Found stored agency data fallback:', agencyData);
          if (mountedRef.current) {
            setAgency(agencyData);
            setLoading(false);
          }
          return;
        } catch (e) {
          console.error('AgencyContext: Error parsing stored agency data:', e);
          localStorage.removeItem('agencyData');
        }
      }

      // Priority 3: Try to get agency by slug for public access
      const slug = getAgencySlug();
      if (!slug || slug === 'undefined' || slug === 'null') {
        if (mountedRef.current) {
          setError('Invalid or missing agency identifier');
          setLoading(false);
        }
        return;
      }

      try {
        if (mountedRef.current) {
          setError(null); // Clear previous errors
        }
        console.log(`AgencyContext: Loading agency by slug: ${slug}`);
        const agencyData = await agencyApi.getBySlug(slug);
        if (mountedRef.current) {
          setAgency(agencyData);
        }
        console.log(`AgencyContext: Loaded public agency data for ${slug}:`, agencyData);
      } catch (err: any) {
        console.error('Failed to load agency data:', err);
        
        if (!mountedRef.current) return; // Don't update state if unmounted
        
        // Handle different error types gracefully
        let errorMessage = 'Failed to load agency data';
        if (err.message?.includes('Agency not found')) {
          errorMessage = 'Agency not found';
        } else if (err.message?.includes('Unexpected end of JSON input')) {
          errorMessage = 'Server configuration error';
        }
        
        setError(errorMessage);
        setAgency(null); // Ensure agency is cleared on error
        
        // Only show toast for actual agency modes, not when it's a false positive
        if (slug && slug.length > 10) { // Likely a real agency slug, not project ID
          if (errorMessage === 'Agency not found') {
            toast.error('Agency not found. Please check the subdomain.');
          } else {
            toast.error('Failed to load agency information.');
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadAgencyData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      mountedRef.current = false;
    };
  }, [isAgencyMode]);

  const value: AgencyContextType = {
    agency,
    isAgencyMode,
    loading,
    error
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
};