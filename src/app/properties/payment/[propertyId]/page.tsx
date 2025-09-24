"use client";

import React, { useState } from "react";
import { Input } from "@woothomes/components/ui/input";
import { Button } from "@woothomes/components/ui/button";
import { useRouter } from "next/navigation";
import { SuccessModal } from "@woothomes/components/properties";
import Image from "next/image";
import { CheckSquare } from "lucide-react";

export default function PaymentForm() {
  const router = useRouter();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("flutterwave");

  function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    setSuccessModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/payment/success");
  }
  const goBack = () => {
    router.back();
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen p-8">
      <div className="p-6 max-w-4xl mx-auto">
        <button
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
          onClick={goBack}
        >
          ← Go Back
        </button>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Complete Your Payment
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Fill out the form to complete your payment
        </p>
      </div>

      <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-800">
              Your Full Name
            </label>
            <Input
              placeholder="Enter name"
              required
              className="bg-[#f9f9ff] py-5 px-4 rounded-lg border-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-800">Email</label>
            <Input
              type="email"
              placeholder="Enter email"
              required
              className="bg-[#f9f9ff] py-5 px-4 rounded-lg border-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-800">
              Phone Number
            </label>
            <div className="flex items-center gap-2 bg-[#f9f9ff] px-4 py-3 rounded-lg">
              <Image
                src="/payment/flag.png"
                alt="Nigeria Flag"
                width={24}
                height={16}
                className="rounded-sm"
              />
              <span className="text-sm font-medium">+234</span>
              <input
                type="text"
                placeholder="Enter number"
                required
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-800">
              Complete payment using
            </label>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <label
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setPaymentMethod("stripe")}
              >
                <Image
                  src="/payment/stripe.png"
                  alt="Stripe"
                  width={60}
                  height={90}
                />
                {paymentMethod === "stripe" && (
                  <CheckSquare className="text-[#00BFFF] text-lg" />
                )}
              </label>

              <div className="h-6 border-l border-gray-300" />

              <label
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setPaymentMethod("paystack")}
              >
                <Image
                  src="/payment/paystack.png"
                  alt="Paystack"
                  width={163}
                  height={90}
                />
                {paymentMethod === "paystack" && (
                  <CheckSquare className="text-[#00BFFF] text-lg" />
                )}
              </label>

              <div className="h-6 border-l border-gray-300" />

              <label
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setPaymentMethod("flutterwave")}
              >
                <Image
                  src="/payment/flutterwave.png"
                  alt="Flutterwave"
                  width={170}
                  height={90}
                />
                {paymentMethod === "flutterwave" && (
                  <CheckSquare className="text-[#00BFFF] text-lg" />
                )}
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              onClick={handleProceed}
              className="bg-[#00BFFF] text-white w-full sm:w-auto px-10 py-5 rounded-lg px-24 cursor-pointer"
            >
              Proceed
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border border-[#00BFFF] text-[#0f172a] w-full sm:w-auto px-10 py-5 rounded-lg bg-transparent px-24 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>

        <SuccessModal
          open={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
        />
      </div>
    </div>
  );
}
