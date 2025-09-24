export const registerServiceWorker = async () => {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Dispatch event to notify that an update is available
              window.dispatchEvent(new Event('update-available'));
            }
          });
        }
      });

      // Handle controller change (update applied)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Handle errors
      registration.addEventListener('error', (error) => {
        console.error('Service worker registration failed:', error);
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

export const unregisterServiceWorker = async () => {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
    }
  }
}; 