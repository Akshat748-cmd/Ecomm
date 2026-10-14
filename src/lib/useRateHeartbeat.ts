import { useEffect } from 'react';
import { useAppStore } from '../store';

/**
 * Hook to run the simulated live rate engine every 5 seconds.
 * Checks quote expiries and updates timestamps.
 * Cleans up interval on unmount.
 */
export function useRateHeartbeat(): void {
  const tickRates = useAppStore((state) => state.tickRates);
  const checkQuoteExpiries = useAppStore((state) => state.checkQuoteExpiries);

  useEffect(() => {
    // Run ticker every 5 seconds
    const interval = setInterval(() => {
      tickRates();
      checkQuoteExpiries();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [tickRates, checkQuoteExpiries]);
}
