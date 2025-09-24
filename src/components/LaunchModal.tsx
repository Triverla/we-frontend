"use client";

import { useState } from "react";
import { X, Mail, CheckCircle, Home, Building2, Calendar, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from "@woothomes/components";
import { axiosBase } from "@woothomes/lib";
import { toast } from "sonner";

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissPermanently?: () => void;
}

export function LaunchModal({ isOpen, onClose, onDismissPermanently }: LaunchModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosBase.post("/newsletter/subscribe", {
        email: email.trim(),
        source: "launch_modal"
      });

      if (response.data.success) {
        setIsSubmitted(true);
        toast.success("Thank you! We'll notify you when we launch.");

        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setEmail("");
        }, 3000);
      } else {
        toast.error(response.data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissPermanently = () => {
    onDismissPermanently?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-gray-200 shadow-xl max-h-[80vh] my-8">
        <DialogHeader>
          <DialogTitle className="sr-only">Launch Notification</DialogTitle>
        </DialogHeader>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Subtle icon background */}
        <div className="relative">
          <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute -top-6 -left-6 opacity-[0.05]">
              <Home className="w-28 h-28" />
            </div>
            <div className="absolute top-6 right-6 opacity-[0.05]">
              <Building2 className="w-24 h-24" />
            </div>
            <div className="absolute bottom-4 left-10 opacity-[0.05]">
              <Building2 className="w-16 h-16" />
            </div>
          </div>

          <div className="relative z-10 p-6">
            {!isSubmitted ? (
              <div className="space-y-6">
                {/* Announcement and overview */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    Launching soon
                  </span>
                  <h2 className="mt-3 text-xl font-semibold text-gray-900">Your next stay, simplified</h2>
                  <p className="mt-1 text-xs text-gray-600">
                    Discover verified apartments, flexible bookings, and seamless payments
                    across top cities.
                  </p>
                </div>

                {/* Key highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-900 text-sm font-medium">
                      <Home className="h-4 w-4 text-blue-600" />
                      Verified stays
                    </div>
                    <p className="mt-1 text-[11px] text-gray-600">Quality apartments and homes</p>
                  </div>
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-900 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Flexible bookings
                    </div>
                    <p className="mt-1 text-[11px] text-gray-600">Short and extended stays</p>
                  </div>
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-gray-900 text-sm font-medium">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Secure payments
                    </div>
                    <p className="mt-1 text-[11px] text-gray-600">Protected, simple checkout</p>
                  </div>
                </div>

                {/* Waitlist form */}
                <div className="rounded-md border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                      <Mail className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Join the waitlist</p>
                      <p className="text-[11px] text-gray-600">Be first to know when we go live</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <label htmlFor="launch-email" className="sr-only">Email address</label>
                      <input
                        id="launch-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 pr-9 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
                        disabled={isSubmitting}
                      />
                      <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isSubmitting ? "Joining..." : "Notify me"}
                    </Button>
                  </form>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span>We respect your privacy.</span>
                    <button onClick={handleDismissPermanently} className="underline underline-offset-2 hover:text-gray-700">
                      Don&#39;t show again
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto mb-3 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">You&#39;re on the list</h3>
                <p className="mt-1 text-xs text-gray-600">We&#39;ll email you as soon as we launch.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 