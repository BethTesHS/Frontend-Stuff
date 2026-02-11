
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  const location = useLocation();
  const { setLoading } = useLoading();
  const isInitialMount = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    console.log('NavigationWrapper: Location changed to:', location.pathname);
    console.log('NavigationWrapper: Previous pathname:', previousPathname.current);
    console.log('NavigationWrapper: isInitialMount:', isInitialMount.current);
    
    // Skip loading on initial page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPathname.current = location.pathname;
      console.log('NavigationWrapper: Skipping initial mount');
      return;
    }

    // Only trigger loading if the pathname actually changed
    if (previousPathname.current === location.pathname) {
      console.log('NavigationWrapper: Same pathname, skipping loading');
      return;
    }

    // Clear any existing timer first
    if (timerRef.current) {
      console.log('NavigationWrapper: Clearing existing timer');
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Update the previous pathname
    previousPathname.current = location.pathname;

    // Start loading
    console.log('NavigationWrapper: Setting loading to true');
    setLoading(true);
    
    // Set timer to stop loading after 3 seconds
    timerRef.current = setTimeout(() => {
      console.log('NavigationWrapper: Timer expired, setting loading to false');
      setLoading(false);
      timerRef.current = null;
    }, 3000);

  }, [location.pathname, setLoading]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('NavigationWrapper: Component unmounting, cleaning up');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setLoading(false);
    };
  }, [setLoading]);

  return <>{children}</>;
};

export default NavigationWrapper;
