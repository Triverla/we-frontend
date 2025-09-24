import { Suspense } from "react";
import { GuestDashboard } from "@woothomes/components";

export default function GuestDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuestDashboard />
    </Suspense>
  );
}
