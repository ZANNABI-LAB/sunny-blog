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

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      data-ad-client="ca-pub-6873591317343081"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdUnit;
