"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@woothomes/store";
// import { toast } from "sonner";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@woothomes/components";

export default function HostDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore((state) => state);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      console.error("Please login to access this page");
      router.replace("/auth/signin");
      return;
    }

    if (!user.roles.includes("host")) {
      console.error("Only Hosts can access this route");
      router.replace("/");
      return;
    }

    setIsAuthorized(true);
    setAuthChecked(true);
  }, [user, hydrated, router]);

  if (!authChecked || !isAuthorized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
