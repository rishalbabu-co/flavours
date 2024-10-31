import { useEffect, useRef } from 'react';

export function useAdsense(adKey: string) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize if not already done and element exists
    if (!initialized.current && adRef.current) {
      // Check if the ins element already has ads
      const insElement = adRef.current.querySelector('.adsbygoogle');
      if (insElement && !insElement.getAttribute('data-adsbygoogle-status')) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        } catch (error) {
          console.error(`Error initializing ad ${adKey}:`, error);
        }
      }
    }

    return () => {
      if (adRef.current) {
        // Clean up the ad container
        adRef.current.innerHTML = '';
        initialized.current = false;
      }
    };
  }, [adKey]);

  return adRef;
}