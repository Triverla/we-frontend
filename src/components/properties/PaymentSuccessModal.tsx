import { Dialog, DialogContent } from "@woothomes/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@woothomes/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center bg-white">
        <h3 className="text-lg font-bold text-[#0ea2e2] mb-2">
          Payment Successful
        </h3>
        <p className="text-sm mb-4">
          Your payment was successful, check your email for your receipt
        </p>
        <CheckCircle2 className="mx-auto text-[#0ea2e2]" size={64} />
        <Button
          onClick={onClose}
          className="mt-6 w-full bg-[#0ea2e2] text-white"
        >
          ok
        </Button>
      </DialogContent>
    </Dialog>
  );
}
