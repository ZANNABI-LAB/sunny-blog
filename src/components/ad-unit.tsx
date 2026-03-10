"use client";

import { useEffect, useRef } from "react";

type AdUnitProps = {
  slot: string;
  className?: string;
};

const AdUnit = ({ slot, className = "" }: AdUnitProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && adRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {}
        );
      } catch {
        // AdSense not loaded yet
      }
    }
  }, []);

  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!adClientId) {
    return (
      <div
        className={`rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted font-display ${className}`}
      >
        AD SPACE
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      data-ad-client={adClientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdUnit;
