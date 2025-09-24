/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton, FormInput } from "@woothomes/components";
// import { toast } from "sonner";
import { axiosBase } from "@woothomes/lib";
import { X } from "lucide-react";

const changePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Current password is required"),
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    new_password_confirmation: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords do not match",
    path: ["new_password_confirmation"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const response = await axiosBase.put("/profile/password", data);
      // toast.success("Password changed successfully");
      onClose();
      console.log(response);
    } catch (error: any) {
      console.error(
        error?.response?.data?.message || "Failed to change password"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <FormInput
              id="current_password"
              type="password"
              placeholder="Current Password"
              error={errors.current_password}
              {...register("current_password")}
            />
          </div>

          <div className="mb-4">
            <FormInput
              id="new_password"
              type="password"
              placeholder="New Password"
              error={errors.new_password}
              {...register("new_password")}
            />
          </div>

          <div className="mb-6">
            <FormInput
              id="new_password_confirmation"
              type="password"
              placeholder="Confirm New Password"
              error={errors.new_password_confirmation}
              {...register("new_password_confirmation")}
            />
          </div>

          <AuthButton isLoading={isSubmitting} type="submit" className="w-full">
            Update Password
          </AuthButton>
        </form>
      </div>
    </div>
  );
}
