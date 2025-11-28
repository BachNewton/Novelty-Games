import { useEffect, useState, useCallback } from 'react';
import { VersionState } from '../ui/State';
import { checkForUpdate } from '../util/VersionChecker';

interface UseVersionCheckOptions {
  /**
   * Interval in milliseconds to automatically check for updates
   * Set to 0 or undefined to disable automatic checking
   */
  checkInterval?: number;
  
  /**
   * Whether to check immediately on mount
   */
  checkOnMount?: boolean;
}

/**
 * React hook for checking PWA version updates
 * 
 * @param options Configuration options for version checking
 * @returns Object with versionState and manual check function
 */
export function useVersionCheck(options: UseVersionCheckOptions = {}) {
  const { checkInterval, checkOnMount = true } = options;
  const [versionState, setVersionState] = useState<VersionState>(VersionState.CHECKING);

  const performCheck = useCallback(async () => {
    // If offline, set to unknown
    if (!navigator.onLine) {
      setVersionState(VersionState.UNKNOWN);
      return;
    }

    setVersionState(VersionState.CHECKING);
    
    const hasUpdate = await checkForUpdate();
    
    if (hasUpdate === null) {
      // Check failed (network error, etc.)
      setVersionState(VersionState.UNKNOWN);
    } else if (hasUpdate) {
      // Update available
      setVersionState(VersionState.OUTDATED);
    } else {
      // Up to date
      setVersionState(VersionState.CURRENT);
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    if (checkOnMount) {
      performCheck();
    }

    // Set up interval checking if specified
    let intervalId: NodeJS.Timeout | undefined;
    if (checkInterval && checkInterval > 0) {
      intervalId = setInterval(performCheck, checkInterval);
    }

    // Listen for online/offline events
    const handleOnline = () => {
      performCheck();
    };

    const handleOffline = () => {
      setVersionState(VersionState.UNKNOWN);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performCheck, checkInterval, checkOnMount]);

  return {
    versionState,
    checkForUpdate: performCheck,
  };
}

