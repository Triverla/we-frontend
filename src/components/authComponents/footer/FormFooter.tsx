import React from "react";
import Link from "next/link";
import { FormFooterProps } from "./formFooter.interface";

export const FormFooter: React.FC<FormFooterProps> = ({
  redirectText,
  redirectLink,
}) => {
  return (
    <div className="text-sm text-gray-600">
      <span>{redirectText}</span>
      <Link href={redirectLink} prefetch={true} className="text-[#1E3A8A] hover:underline">
        {redirectLink.includes("signin") ? "Sign in" : "Sign Up"}
      </Link>
    </div>
  );
};
