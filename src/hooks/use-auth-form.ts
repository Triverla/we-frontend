"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, signupSchema, axiosBase } from "@woothomes/lib";
import { SignupFormData, LoginFormData } from "@woothomes/components";
import { useState } from "react";
// import { toast } from "sonner";
import { useAuthStore } from "@woothomes/store";
import { useRouter } from "next/navigation";

type UseAuthFormProps = {
  formType: "signin" | "signup" | "host-signup";
  redirectUrl?: string;
};

export const useAuthForm = ({ formType, redirectUrl }: UseAuthFormProps) => {
  const isSignup = formType === "signup" || formType === "host-signup";
  const schema = isSignup ? signupSchema : loginSchema;
  const setAuth = useAuthStore((state) => state.setAuth);
  const formConfig = useForm<SignupFormData | LoginFormData>({
    resolver: zodResolver(schema),
    mode: "onChange", 
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignupFormData | LoginFormData) => {
    try {
      setLoading(true);

      if (formType === "signup") {
        data = { ...data, role: "guest" };
      }

      if (formType === "host-signup") {
        data = { ...data, role: "host" };
      }

      const response = await axiosBase.post(
        formType === "signup" || formType === "host-signup"
          ? "auth/register"
          : "auth/login",
        data
      );

      if (response.status === 200 || response.status === 201) {
        const { token, user } = response.data.data;
        setAuth(token, user);
        setLoading(false);

        // toast.success(response.data.message);
        
        // If we have a redirectUrl from protected route, use it after login
        if (redirectUrl && formType === "signin") {
          router.push(redirectUrl);
        } else {
          // Always redirect users with dual roles to guest dashboard
          // Only redirect to host dashboard if they only have host role
          const hasGuestRole = user.roles.includes("guest");
          const hasHostRole = user.roles.includes("host");
          
          if (formType === "signup" || formType === "host-signup") {
            router.push("/auth/verify-email");
          } else if (hasGuestRole) {
            // Prioritize guest dashboard if user has guest role
            router.push("/");
          } else if (hasHostRole) {
            // Only redirect to host dashboard if user only has host role
            router.push("/host/dashboard");
          } else {
            // Fallback for any other case
            router.push("/");
          }
        }
      } else {
        setLoading(false);
        console.error("Something went wrong, please try again.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error?.message);
      console.log("Error during authentication:", error);
      setLoading(false);
    }
  };

  const getFormConfig = () => {
    const baseConfig = {
      formInputs: [
        ...(isSignup
          ? [
              {
                key: "name",
                type: "text",
                placeholder: "Full Name",
              },
              {
                key: "phone",
                type: "text",
                placeholder: "Phone",
              },
            ]
          : []),
        {
          key: "email",
          type: "email",
          placeholder: "Email",
        },
        {
          key: "password",
          type: "password",
          placeholder: "Password",
        },

        ...(isSignup
          ? [
              {
                key: "password_confirmation",
                type: "password",
                placeholder: "Confirm Password",
              },
            ]
          : []),
      ],
    };

    const configs = {
      signin: {
        formHeader: "Sign In",
        formSubtitle:
          "Welcome back! Sign in to access your account and stay connected.",
      },
      signup: {
        formHeader: "Sign Up",
        formSubtitle: "Create an account to enjoy all the features.",
      },
      "host-signup": {
        formHeader: "Become a Host",
        formSubtitle: "Sign up and list your property on woothomes.",
      },
    };

    return {
      ...baseConfig,
      ...configs[formType],
    };
  };

  return {
    ...formConfig,
    onSubmit,
    getFormConfig,
    loading,
  };
};
