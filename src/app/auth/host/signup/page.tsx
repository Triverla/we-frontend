"use client";

import { useAuthForm } from "@woothomes/hooks/use-auth-form";
import { AuthForm } from "@woothomes/components";

export default function HostSignup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    onSubmit,
    getFormConfig,
    loading,
  } = useAuthForm({
    formType: "host-signup",
  });

  const { formHeader, formSubtitle, formInputs } = getFormConfig();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8 sm:p-16 gap-4 font-geist-sans text-gray-800">
      <AuthForm
        isLoading={loading}
        formType="host-signup"
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        errors={errors}
        formHeader={formHeader}
        formSubtitle={formSubtitle}
        formInputConfig={formInputs}
      />
    </div>
  );
}
