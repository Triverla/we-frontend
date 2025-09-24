import { useState, useEffect } from "react";

export function useLaunchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has permanently dismissed the modal
    const hasPermanentlyDismissed = localStorage.getItem("launch-modal-dismissed");
    
    // Check if modal has been shown in this session
    const hasShownThisSession = sessionStorage.getItem("launch-modal-shown");
    
    // Only show if not permanently dismissed and not shown this session
    if (!hasPermanentlyDismissed && !hasShownThisSession) {
      // Show modal after a delay (3 seconds)
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem("launch-modal-shown", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  const dismissPermanently = () => {
    localStorage.setItem("launch-modal-dismissed", "true");
    setIsOpen(false);
  };

  const showModal = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    closeModal,
    dismissPermanently,
    showModal,
    hasShown
  };
} 