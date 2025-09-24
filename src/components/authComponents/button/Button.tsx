import React from "react";
import { ButtonProps } from "./button.interface";

export const AuthButton: React.FC<ButtonProps> = ({
  type = "button",
  children,
  onClick,
  className = "",
  isLoading = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`p-3 bg-[#06A2E2] text-white rounded-md hover:bg-blue-500 transition-all duration-300 cursor-pointer flex items-center justify-center ${className} ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};
