"use client";

import React, { useState } from "react";
import { AuthButton } from "../button";
import { SocialAuthButton } from "../button/SocialAuthButton";
import { FormFooter } from "../footer";
import {
  FormInput,
  LoginFormData,
  SignupFormData,
} from "@woothomes/components";
import {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
} from "react-hook-form";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

type FormData = SignupFormData | LoginFormData;

type AuthFormProps = {
  formType: "signin" | "signup" | "host-signup";
  register: UseFormRegister<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: (data: FormData) => void;
  errors: FieldErrors<FormData>;
  formHeader: string;
  formSubtitle: string;
  formInputConfig: Array<{
    key: string;
    type: string;
    placeholder: string;
  }>;
  isLoading?: boolean;
};

export const AuthForm: React.FC<AuthFormProps> = ({
  formType,
  register,
  handleSubmit,
  onSubmit,
  errors,
  formHeader,
  formSubtitle,
  formInputConfig,
  isLoading = false,
}) => {
  // Password requirements
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      test: (pw: string) => pw.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "At least one lowercase letter",
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      label: "At least one number",
      test: (pw: string) => /[0-9]/.test(pw),
    },
    {
      label: "At least one special character",
      test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
    },
  ];

  // Helper to determine if a field is the password field
  const isPasswordField = (input: typeof formInputConfig[number]) =>
    input.type === "password" && (input.key === "password" || input.key === "new_password");

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError(null);
  };

  const handleFormSubmit = (data: FormData) => {
    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA.");
      return;
    }
    onSubmit({ ...data, recaptchaToken } as FormData);
  };

  return (
    <div className="flex flex-col sm:items-center text-center sm:text-left flex-grow justify-center items-center">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full max-w-md flex flex-col gap-4 bg-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-semibold text-[#06A2E2]">{formHeader}</h1>
        <p className="text-base mb-4">{formSubtitle}</p>

        {formInputConfig.map((input) =>
          isPasswordField(input) ? (
            <div key={input.key} className="flex flex-col gap-1">
              <FormInput
                id={input.key}
                type="password"
                placeholder={input.placeholder}
                error={errors[input.key as keyof FormData]}
                label=""
                onFocus={() => setPasswordFocused(true)}
                {...register(input.key as keyof FormData, {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
                })}
              />
              {(formType !== "signin" && (passwordFocused || password.length > 0)) && (
                <ul className="mt-1 mb-2 text-left space-y-1">
                  {passwordRequirements.map((req, idx) => {
                    const passed = req.test(password);
                    return (
                      <li
                        key={idx}
                        className={
                          passed
                            ? "text-green-600 text-sm flex items-center gap-1"
                            : "text-gray-500 text-sm flex items-center gap-1"
                        }
                      >
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: passed ? '#16a34a' : '#d1d5db' }}></span>
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <FormInput
              key={input.key}
              id={input.key}
              type={input.type as "text" | "email" | "password"}
              placeholder={input.placeholder}
              error={errors[input.key as keyof FormData]}
              label=""
              {...register(input.key as keyof FormData)}
            />
          )
        )}
        {(formType === "signup" || formType === "host-signup") && (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1"
              required
              {...register("accept_terms")}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-[#1E3A8A] hover:underline">
                Terms and Conditions
              </a>
            </label>
          </div>
        )}
        {formType === "signin" && (
          <div className="flex items-start gap-2">
            <input type="checkbox" id="remember" className="mt-1" />
            <label
              htmlFor="remember"
              className="w-full flex justify-between text-sm text-gray-600"
            >
              <p>Remember me </p>

              <Link href="/auth/forgot-password">Forgot password?</Link>
            </label>
          </div>
        )}
        <div className="flex flex-col items-center mb-2">
          <ReCAPTCHA
            sitekey="6LcP5GwrAAAAAN03MJw073MFMxyqfiHqlHJp4u-h" //Temporary
            onChange={handleRecaptchaChange}
          />
          {recaptchaError && (
            <span className="text-red-500 text-xs mt-1">{recaptchaError}</span>
          )}
        </div>
        <AuthButton isLoading={isLoading} type="submit">
          {formType === "signin" ? "Sign In" : "Sign Up"}
        </AuthButton>
        <FormFooter
          redirectText={
            formType === "signin"
              ? "Don't have an account? "
              : "Already have an account? "
          }
          redirectLink={formType === "signin" ? "/auth/signup" : "/auth/signin"}
        />
        <div className="relative">
          <div className="relative flex justify-center text-sm">
            <span className="bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SocialAuthButton
            provider="google"
            onClick={() => console.log("Google signin")}
          />
          <SocialAuthButton
            provider="facebook"
            onClick={() => console.log("Facebook signin")}
          />
        </div>
      </form>
    </div>
  );
};
