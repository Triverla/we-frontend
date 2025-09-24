"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthButton, FormInput } from "@woothomes/components";
import { axiosBase, passwordResetSchema } from "@woothomes/lib";
import { useAuthStore } from "@woothomes/store";
// import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function PasswordReset() {
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const { passwordResetEmail, passwordResetPin, clearPasswordResetData } =
    useAuthStore((state) => state);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      const payload = {
        pin: passwordResetPin,
        email: passwordResetEmail,
        ...data,
      };
      await axiosBase.post("/auth/password/reset", payload);

      // toast.success(response.data.message);
      clearPasswordResetData();
      setIsResetSuccessful(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error resetting password:", error);
      // Handle error state
      // toast.success(error.message);
    }
  };

  return (
    <div className="w-full flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg relative p-8">
        {!isResetSuccessful ? (
          <>
            <h2 className="text-3xl font-bold text-[#06A2E2] mb-2">
              Choose a New Password
            </h2>
            <p className="text-gray-700 mb-6">
              Choose a new password you&apos;ll easily remember{" "}
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 relative">
                <div className="relative">
                  <FormInput
                    id="password"
                    type="password"
                    placeholder="Password"
                    error={errors.password}
                    className={`w-full p-4 bg-gray-50 rounded-md ${
                      errors.password ? "border border-red-500" : ""
                    }`}
                    {...register("password")}
                  />
                </div>
              </div>

              <div className="mb-6 relative">
                <div className="relative">
                  <FormInput
                    type="password"
                    id="password_confirmation"
                    placeholder="Confirm Password"
                    error={errors.password_confirmation}
                    className={`w-full p-4 bg-gray-50 rounded-md ${
                      errors.password_confirmation
                        ? "border border-red-500"
                        : ""
                    }`}
                    {...register("password_confirmation")}
                  />
                </div>
              </div>

              <AuthButton
                isLoading={isSubmitting}
                className="w-full mt-12"
                type="submit"
              >
                Reset password
              </AuthButton>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold text-[#06A2E2] mb-2">
              Password Reset Successful
            </h2>
            <p className="text-gray-700 mb-10">
              Your password has been successfully reset, log back into your
              account
            </p>

            <div className="flex justify-center mb-10">
              <CheckCircle size={80} className="text-[#06A2E2]" />
            </div>

            <button
              onClick={() => {
                router.replace("/auth/signin");
              }}
              className="cursor-pointer w-full bg-[#06A2E2] text-white p-4 rounded-md hover:bg-[#06A2E2]/90 transition-colors"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
