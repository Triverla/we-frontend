'use client';

import { Button } from "@woothomes/components";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-gray-600 mb-8">
          We can&apos;t connect to the internet right now. Please check your connection and try again.
        </p>
        <Button
          onClick={() => router.refresh()}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
} 