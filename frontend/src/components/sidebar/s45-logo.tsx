'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface S45LogoProps {
  size?: number;
}

export function S45Logo({ size = 24 }: S45LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Image
        src="/s45_logo.jpeg"
        alt="S45"
        width={size}
        height={size}
        className="flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
  );
}
