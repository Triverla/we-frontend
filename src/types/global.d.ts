interface Window {
  workbox: {
    addEventListener: (event: string, callback: () => void) => void;
    removeEventListener: (event: string, callback: () => void) => void;
    register: () => void;
    postMessage: (message: { type: string }) => void;
  };
} 