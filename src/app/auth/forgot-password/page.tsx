"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton } from "@woothomes/components";
import Link from "next/link";
import {
  forgotPasswordSchema,
  signUpVerificationSchema,
  axiosBase,
} from "@woothomes/lib";
import { TriangleAlert } from "lucide-react";
import { useAuthStore } from "@woothomes/store";
import { useRouter } from "next/navigation";

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type OTPInput = z.infer<typeof signUpVerificationSchema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState("");
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const { setPasswordResetEmail, setPasswordResetPin } = useAuthStore(
    (state) => state
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: otpRegister,
    setValue: setOtpValue,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPInput>({
    resolver: zodResolver(signUpVerificationSchema),
  });
  const router = useRouter();

  useEffect(() => {
    const otpValue = otp.join("");
    setOtpValue("otp", otpValue);
  }, [otp, setOtpValue]);

  const handleEmailSubmit = async (data: ForgotPasswordInput) => {
    try {
      setLoading(true);
      await axiosBase.post("/auth/password/email", data);

      setEmail(data.email);
      setShowOtpInput(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error.errors?.email?.[0] || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onOtpSubmit = async (data: OTPInput) => {
    try {
      setLoading(true);
      const payload = {
        pin: data.otp,
        email,
      };
      await axiosBase.post("/auth/password/validate-pin", payload);

      setPasswordResetEmail(email);
      setPasswordResetPin(payload.pin);
      router.replace("/auth/reset-password");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorResponse(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await axiosBase.post("/auth/password/email", { email });
      // toast.success("OTP resent successfully");
    } catch {
      console.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <div className="w-full max-w-lg bg-white p-4 sm:p-8 md:p-12 rounded-xl shadow-lg text-left font-geist-sans">
        {!showOtpInput ? (
          <>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#06A2E2] mb-2">
              Forgot Password
            </h1>
            <p className="max-w-lg text-sm sm:text-base text-gray-700 mb-8">
              Enter the email address linked to your account and we&apos;ll send
              you an OTP to reset your password
            </p>

            <form
              onSubmit={handleSubmit(handleEmailSubmit)}
              className="space-y-4 text-left"
            >
              <div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                  className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm sm:text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#f7f7fd]"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <AuthButton
                isLoading={loading}
                className="w-full mt-8"
                type="submit"
              >
                Send OTP
              </AuthButton>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#06A2E2]">
              Enter OTP
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mb-6">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{email}</span>
            </p>

            <form onSubmit={handleOtpSubmit(onOtpSubmit)}>
              <div className="flex flex-row gap-1 sm:gap-2 justify-between mb-4 mt-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none text-lg bg-[#f7f7fd]"
                  />
                ))}
              </div>
              <input type="hidden" {...otpRegister("otp")} />
              {otpErrors.otp && (
                <p className="flex items-center gap-2 text-red-500 text-sm mb-2">
                  <TriangleAlert className="w-4 h-4" /> {otpErrors.otp.message}
                </p>
              )}
              {errorResponse && (
                <p className="flex items-center gap-2 text-red-500 text-sm mb-2">
                  <TriangleAlert className="w-4 h-4" /> {errorResponse}
                </p>
              )}
              <AuthButton
                isLoading={loading}
                className="w-full mt-8"
                type="submit"
              >
                Verify OTP
              </AuthButton>
              <button
                type="button"
                onClick={handleResendOTP}
                className="cursor-pointer w-full mt-3 text-sm font-medium text-[#06A2E2] hover:underline"
              >
                Resend OTP
              </button>
            </form>
          </>
        )}

        <p className="flex w-full justify-end mt-8 text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/auth/signin"
            className="text-[#06A2E2] font-medium hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
