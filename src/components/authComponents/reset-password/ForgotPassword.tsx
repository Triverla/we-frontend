/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef } from "react";
import { X } from "lucide-react";

type Step = "email" | "otp" | "newPassword" | "success";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email address not found");
      return;
    }

    try {
      setStep("otp");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.some((digit) => !digit)) {
      setError("Incorrect OTP");
      return;
    }

    try {
      setStep("success");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <h2 className="text-[#00A7E1] text-2xl font-semibold mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600">
                Enter the email address linked to your account and we&apos;ll send
                you an OTP to reset your passsword
              </p>
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${error ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                placeholder="joy@email.com"
              />
              {error && (
                <div className="mt-2 flex items-center text-red-500">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 9v5m0 3h.01M12 3l9 16H3L12 3z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#00A7E1] text-white py-3 rounded-lg hover:bg-[#0095c8] transition-colors"
            >
              Send OTP
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                Did you remember your password? Sign In
              </button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <h2 className="text-[#00A7E1] text-2xl font-semibold mb-2">
                Enter OTP
              </h2>
              <p className="text-gray-600">
                Enter the OTP we sent to your email
              </p>
            </div>

            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                    return undefined;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl border rounded-lg ${error ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                  maxLength={1}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center text-red-500">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v5m0 3h.01M12 3l9 16H3L12 3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#00A7E1] text-white py-3 rounded-lg hover:bg-[#0095c8] transition-colors"
            >
              Submit
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="text-center space-y-6">
            <h2 className="text-[#00A7E1] text-2xl font-semibold">
              Password Reset Successful
            </h2>
            <p className="text-gray-600">
              Your password has been successfully reset, log back into your
              account
            </p>

            <div className="w-20 h-20 mx-auto bg-[#00A7E1] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#00A7E1] text-white py-3 rounded-lg hover:bg-[#0095c8] transition-colors"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}