"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AccountLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  paragraph?: string;
  width?: string;
  onBackClick?: () => void;
}

export default function AccountLayout({
  children,
  title,
  breadcrumb,
  paragraph,
  width = "max-w-7xl",
  onBackClick,
}: AccountLayoutProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push("/account");
    }
  };

  return (
    <div className="bg-[#EEEEEE] min-h-screen py-8">
      <div className={`${width} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center text-sm font-extrabold text-black hover:text-gray-800 cursor-pointer"
          >
            <span className="w-6 h-6 flex bg-[#f4f2fe] items-center justify-center rounded-full border border-black mr-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </span>
            Go Back
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
            {title}
          </h1>
          <p className="text-gray-600 mt-2 mb-8">{paragraph}</p>
        </div>
        {breadcrumb && (
          <div className="text-sm text-gray-600 mb-8 font-extrabold">
            My Account &gt; {breadcrumb}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
