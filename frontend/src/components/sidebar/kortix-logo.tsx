'use client';

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

  const shouldInvert = mounted && (
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
  );

  return (
    <div
      className={`${shouldInvert ? 'text-white' : 'text-black'} flex-shrink-0 font-bold text-xl tracking-tight`}
      style={{ fontSize: size * 0.8, minWidth: size, minHeight: size }}
    >
      s45
    </div>
  );
}

// Export with original name for backwards compatibility
export const KortixLogo = S45Logo;
