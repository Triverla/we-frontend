'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@woothomes/lib/serviceWorker';
import { ServiceWorkerUpdate } from './ServiceWorkerUpdate';

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  if (!updateAvailable) {
    return null;
  }

  return <ServiceWorkerUpdate onUpdate={() => setUpdateAvailable(false)} />;
} 