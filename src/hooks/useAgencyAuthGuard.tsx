import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAgency } from '@/contexts/AgencyContext';

export const useAgencyAuthGuard = () => {
  const navigate = useNavigate();
  const { isAgencyMode, loading: agencyLoading } = useAgency();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (agencyLoading) {
      console.log('useAgencyAuthGuard: Agency context still loading...');
      return;
    }

    // Mark as initialized after agency loading completes
    if (!hasInitialized) {
      console.log('useAgencyAuthGuard: Initialization complete, checking auth...');
      setHasInitialized(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Check if we're in agency mode - if not, just mark as no access without redirecting
    if (!isAgencyMode) {
      console.log('useAgencyAuthGuard: Not in agency mode, no access granted');
      setHasAccess(false);
      setLoading(false);
      return;
    }

    // Check for agency authentication token
    const agencyToken = localStorage.getItem('agencyToken');
    const agencyData = localStorage.getItem('agencyData');
    const userData = localStorage.getItem('user');

    console.log('useAgencyAuthGuard: Checking authentication...', {
      hasToken: !!agencyToken,
      hasAgencyData: !!agencyData,
      hasUserData: !!userData
    });

    if (!agencyToken) {
      console.log('useAgencyAuthGuard: No agency token found, redirecting to login');
      // Preserve the agency parameter in the URL
      const currentUrl = new URL(window.location.href);
      const agencyParam = currentUrl.searchParams.get('agency');
      const loginUrl = agencyParam ? `/login?agency=${agencyParam}` : '/login';
      navigate(loginUrl);
      setLoading(false);
      setHasAccess(false);
      return;
    }

    try {
      // Validate that we have valid agency data or user data
      let isValid = false;

      if (agencyData) {
        const parsedAgencyData = JSON.parse(agencyData);
        if (parsedAgencyData.id && parsedAgencyData.name) {
          console.log('useAgencyAuthGuard: Valid agency data found:', parsedAgencyData.name);
          isValid = true;
        }
      }

      if (!isValid && userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.id && parsedUserData.role === 'agency_admin') {
          console.log('useAgencyAuthGuard: Valid user data found for agency admin:', parsedUserData.name);
          isValid = true;
        }
      }

      if (!isValid) {
        console.log('useAgencyAuthGuard: Invalid or missing agency/user data, redirecting to login');
        // Clear invalid data
        localStorage.removeItem('agencyToken');
        localStorage.removeItem('agencyData');
        localStorage.removeItem('user');

        // Preserve the agency parameter in the URL
        const currentUrl = new URL(window.location.href);
        const agencyParam = currentUrl.searchParams.get('agency');
        const loginUrl = agencyParam ? `/login?agency=${agencyParam}` : '/login';
        navigate(loginUrl);
        setLoading(false);
        setHasAccess(false);
        return;
      }

      console.log('useAgencyAuthGuard: Agency authenticated successfully');
      setHasAccess(true);
    } catch (error) {
      console.error('useAgencyAuthGuard: Error parsing data:', error);
      // Clear corrupted data
      localStorage.removeItem('agencyToken');
      localStorage.removeItem('agencyData');
      localStorage.removeItem('user');

      // Preserve the agency parameter in the URL
      const currentUrl = new URL(window.location.href);
      const agencyParam = currentUrl.searchParams.get('agency');
      const loginUrl = agencyParam ? `/login?agency=${agencyParam}` : '/login';
      navigate(loginUrl);
      setHasAccess(false);
    }

    setLoading(false);
  }, [navigate, isAgencyMode, agencyLoading, hasInitialized]);

  return { loading, hasAccess };
};