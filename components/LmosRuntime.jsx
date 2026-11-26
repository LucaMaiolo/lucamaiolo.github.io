'use client';

import { useEffect } from 'react';

// Starts the LM/OS engine once the static page is in the browser.
// three.js is loaded lazily so the HTML shows up before the 3D code downloads.
export default function LmosRuntime() {
  useEffect(() => {
    let stop;
    let cancelled = false;
    import('@/lib/lmos').then(({ startLmos }) => {
      if (!cancelled) stop = startLmos();
    });
    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }, []);
  return null;
}
