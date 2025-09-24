// components/ui/PrimaryButton.tsx
"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "tertiary" | "danger";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
  isLoading?: boolean;
}

export const PrimaryButton = ({
  children,
  className,
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}: PrimaryButtonProps) => {
  const baseStyles = "font-medium rounded cursor-pointer";
  const variants: Record<Variant, string> = {
    primary: "bg-[#06A2E2] hover:bg-[#1E3A8A] text-white py-2 px-4",
    secondary: "w-full sm:w-auto px-6 py-3 sm:py-2 text-[#1E3A8A] hover:bg-gray-100 border border-[#1E3A8A]",
    tertiary: "bg-transparent text-blue-600 hover:underline",
    danger: "bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto px-6 py-3 sm:py-2"
  };

  return (
    <button
      type="submit"
      className={clsx(baseStyles, variants[variant], className, isLoading && "opacity-60 cursor-not-allowed")}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
