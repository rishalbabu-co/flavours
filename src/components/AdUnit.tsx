import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: 'in-article' | 'display';
  className?: string;
}

export default function AdUnit({ slot, format = 'auto', layout = 'display', className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (adRef.current && !isLoaded.current) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isLoaded.current = true;
      } catch (error) {
        console.error('Error loading AdSense:', error);
      }
    }

    return () => {
      isLoaded.current = false;
    };
  }, []);

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}