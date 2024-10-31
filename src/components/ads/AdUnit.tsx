import React from 'react';
import { useAdsense } from '../../hooks/useAdsense';

interface AdUnitProps {
  adKey: string;
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: 'in-article' | 'display';
  className?: string;
}

export default function AdUnit({ 
  adKey,
  slot, 
  format = 'auto', 
  layout = 'display', 
  className = '' 
}: AdUnitProps) {
  const adRef = useAdsense(adKey);

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1234567890123456" // Replace with your actual AdSense ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}