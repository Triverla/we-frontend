'use client';

import { useEffect } from 'react';
import { UpdateBanner } from './UpdateBanner';

interface ServiceWorkerUpdateProps {
  onUpdate: () => void;
}

export function ServiceWorkerUpdate({ onUpdate }: ServiceWorkerUpdateProps) {
  useEffect(() => {
    const handleUpdate = () => {
      onUpdate();
    };

    window.addEventListener('update-available', handleUpdate);
    return () => window.removeEventListener('update-available', handleUpdate);
  }, [onUpdate]);

  return (
    <UpdateBanner
      onUpdate={() => window.location.reload()}
      onDismiss={() => {
        // Dispatch event to notify service worker that update was dismissed
        window.dispatchEvent(new Event('update-dismissed'));
      }}
    />
  );
} 