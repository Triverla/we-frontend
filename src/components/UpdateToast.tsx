'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const UpdateToast = () => {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleUpdate = () => {
        setShowReload(true);
      };

      window.addEventListener('update-available', handleUpdate);
      return () => window.removeEventListener('update-available', handleUpdate);
    }
  }, []);

  const reloadPage = () => {
    setShowReload(false);
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {showReload && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              New Version Available
            </h3>
            <p className="text-gray-600 mb-4">
              A new version of the app is available. Would you like to update now?
            </p>
            <button
              onClick={reloadPage}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Update Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 