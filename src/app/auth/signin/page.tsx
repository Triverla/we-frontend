"use client";

import { useAuthForm } from "@woothomes/hooks/use-auth-form";
import { AuthForm } from "@woothomes/components";
import { useAuthStore } from "@woothomes/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Create a separate component that uses useSearchParams
function SignInForm() {
  const { user, hydrated } = useAuthStore((state) => state);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the redirect URL from query parameters if it exists
  const redirectUrl = searchParams?.get('redirect');

  useEffect(() => {
    // Wait for hydration to complete before checking
    if (!hydrated) return;

    if (user) {
      // If we have a redirect URL, use it
      if (redirectUrl) {
        return router.replace(redirectUrl);
      }
      
      // Otherwise, use default redirects based on role
      if (user.roles.includes("host")) {
        return router.replace("/host/dashboard");
      }

      if (user.roles.includes("guest")) {
        return router.replace("/guest/dashboard");
      }
    }
  }, [user, hydrated, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    onSubmit,
    getFormConfig,
    loading,
  } = useAuthForm({
    formType: "signin",
    ...(redirectUrl ? { redirectUrl } : {}),
  });

  const { formHeader, formSubtitle, formInputs } = getFormConfig();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8 sm:p-16 gap-4 font-montserrat text-gray-800">
      <AuthForm
        isLoading={loading}
        formType="signin"
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        errors={errors}
        formHeader={formHeader}
        formSubtitle={formSubtitle}
        formInputConfig={formInputs}
      />
      {redirectUrl && (
        <div className="text-center mt-4 text-sm text-blue-600">
          You&apos;ll be redirected back after signing in
        </div>
      )}
    </div>
  );
}

// Main page component wrapped with Suspense
export default function Login() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
