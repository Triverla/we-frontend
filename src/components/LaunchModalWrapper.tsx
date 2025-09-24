"use client";

import { LaunchModal } from "./LaunchModal";
import { useLaunchModal } from "@woothomes/hooks/useLaunchModal";

export function LaunchModalWrapper() {
  const { isOpen, closeModal, dismissPermanently } = useLaunchModal();

  return (
    <LaunchModal 
      isOpen={isOpen} 
      onClose={closeModal} 
      onDismissPermanently={dismissPermanently}
    />
  );
} 