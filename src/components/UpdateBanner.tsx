'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

interface UpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p className="text-sm font-medium">
                  A new version of Woothomes is available!
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onUpdate}
                  className="px-4 py-1.5 bg-white text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors duration-200"
                >
                  Update Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-white hover:text-blue-100 transition-colors duration-200"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 