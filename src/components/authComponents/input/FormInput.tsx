"use client";

import React, { useState } from "react";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { FormInputProps } from "./formInput.interface";

export const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  type = "text",
  placeholder,
  error,
  isCalendar,
  rows = 4,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative gap-4">
        {/* Calendar icon */}
        {isCalendar && type !== "password" && (
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
        )}

        {type === "textarea" ? (
          <textarea
            id={id}
            name={id}
            placeholder={placeholder}
            rows={rows}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`p-3 w-full border rounded-md focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            } bg-[#F7F7FD]`}
          />
        ) : (
          <input
            type={
              type === "password" ? (showPassword ? "text" : "password") : type
            }
            id={id}
            name={id}
            placeholder={placeholder}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            className={`p-3 w-full border rounded-md focus:outline-none focus:ring-2 ${
              type === "password" ? "pr-10" : ""
            } ${isCalendar ? "pl-10" : ""} ${
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            } bg-[#F7F7FD]`}
          />
        )}

        {/* Password toggle */}
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <span className="text-xs text-red-500 min-h-[0.25rem] mt-2">
        {error?.message ?? " "}
      </span>
    </div>
  );
};
