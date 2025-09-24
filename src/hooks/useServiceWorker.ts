'use client';

import { useState, useEffect } from 'react';

type Workbox = {
  addEventListener: (event: string, callback: () => void) => void;
  removeEventListener: (event: string, callback: () => void) => void;
  register: () => void;
  postMessage: (message: { type: string }) => void;
};

export const useServiceWorker = () => {
  const [waitingWorker, setWaitingWorker] = useState<Workbox | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // Add event listeners to handle PWA lifecycle
      const promptNewVersionAvailable = () => {
        setShowReload(true);
        setWaitingWorker(wb);
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);
      wb.addEventListener('externalwaiting', promptNewVersionAvailable);

      // Register service worker after page load
      wb.register();

      return () => {
        wb.removeEventListener('waiting', promptNewVersionAvailable);
        wb.removeEventListener('externalwaiting', promptNewVersionAvailable);
      };
    }
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload();
  };

  return {
    showReload,
    reloadPage,
  };
}; 