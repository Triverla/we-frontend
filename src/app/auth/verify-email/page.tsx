"use client";

import { AuthButton } from "@woothomes/components";
import { useRef, useState, KeyboardEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpVerificationSchema } from "@woothomes/lib";
import { z } from "zod";
import { axiosBase } from "@woothomes/lib";
import { useAuthStore } from "@woothomes/store";
// import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

const EmailVerification = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const user = useAuthStore((state) => state.user);
  const [loading, setIsLoading] = useState(false);
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof signUpVerificationSchema>>({
    resolver: zodResolver(signUpVerificationSchema),
  });

  useEffect(() => {
    const otpValue = otp.join("");
    setValue("otp", otpValue);
  }, [otp, setValue]);

  useEffect(() => {
    if (verified) {
      const targetPath = user?.roles.includes("guest")
        ? "/guest/dashboard"
        : "/host/dashboard";
      router.push(targetPath);
    }
  }, [verified, user?.roles, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: z.infer<typeof signUpVerificationSchema>) => {
    setIsLoading(true);
    setErrorResponse(null);
    const payload = {
      pin: data.otp,
      email: user?.email,
    };

    try {
      const response = await axiosBase.post("/auth/email/verify", payload);
      setIsLoading(false);
      setVerified(response.data.success);
      // toast.success("Email verified successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setIsLoading(false);
      setErrorResponse(error.message);
      setVerified(false);
    }
  };

  const handleResendOTP = async () => {
    const payload = {
      email: user?.email,
    };

    try {
      setIsLoading(true);
      await axiosBase.post(
        "/auth/email/resend-verification",
        payload
      );
      setIsLoading(false);
      // toast.success(response.data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setIsLoading(false);
      setErrorResponse(error.message);
    }
  };

  return (
    <div className="w-full flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-12 rounded-xl shadow-lg text-left font-geist-sans">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#06A2E2]">
          Verify Your Email
        </h1>
        <p className="text-sm sm:text-base">
          Enter the OTP we sent to your email
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 sm:mt-16">
          <div className="flex flex-col gap-6 sm:gap-2">
            <div>
              <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-4 sm:mb-6">
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
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-full aspect-square text-center border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-lg bg-[#f7f7fd]"
                  />
                ))}
              </div>
              <input type="hidden" {...register("otp")} />

              {errors.otp && (
                <p className="flex items-center gap-2 text-red-500 text-xs sm:text-sm mb-4">
                  <TriangleAlert size={16} /> {errors.otp.message}
                </p>
              )}

              {errorResponse && (
                <p className="flex items-center gap-2 text-red-500 text-xs sm:text-sm mb-4">
                  <TriangleAlert size={16} /> {errorResponse}
                </p>
              )}
            </div>

            <div>
              <AuthButton
                isLoading={loading}
                className="w-full text-sm sm:text-base"
                type="submit"
              >
                Verify Email
              </AuthButton>
              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full mt-3 sm:mt-4 text-xs sm:text-sm font-medium cursor-pointer"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
