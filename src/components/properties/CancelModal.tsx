import { useState } from "react";
import { Dialog, DialogContent } from "@woothomes/components/ui/dialog";
import { Button } from "@woothomes/components/ui/button";

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function CancelModal({ open, onClose, onConfirm, isLoading = false }: CancelModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="text-center bg-white space-y-4">
        <h3 className="text-lg font-semibold">Cancel Booking</h3>
        <p className="text-sm text-muted-foreground">
          Let us know why you&apos;re canceling. You&apos;ll have to begin the booking
          process again.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason for cancelling..."
          className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isLoading}
        />
        <div className="flex justify-center gap-4 mt-2">
          <Button
            onClick={handleConfirm}
            className="bg-red-500 text-white px-10 cursor-pointer"
            disabled={!reason.trim() || isLoading}
            isLoading={isLoading}
          >
            Cancel Booking
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="bg-white text-blue-700 border-blue-600 cursor-pointer"
            disabled={isLoading}
          >
            Keep My Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
