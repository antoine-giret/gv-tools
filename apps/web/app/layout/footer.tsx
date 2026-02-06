'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const date = new Date();

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <div className="h-16 shrink-0 px-6 flex items-center justify-center gap-3">
      <span className="text-sm">© Giret {date.getFullYear()}</span>
      {mounted && (
        <>
          <span className="text-sm">|</span>
          <a className="text-sm underline" href="#" onClick={toggleTheme}>
            {theme === 'dark' ? <>Thème clair</> : <>Thème sombre</>}
          </a>
        </>
      )}
    </div>
  );
}
