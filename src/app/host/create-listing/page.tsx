"use client";

import { PropertyListingContainer } from "@woothomes/components/listing/PropertyListingContainer";
import { useRouter } from "next/navigation";

export default function CreateListingPage() {
    const router = useRouter();
    
    const handleComplete = () => {
        router.push("/host/listings");
    };

    const handleRefetchDashboard = () => {
        // No-op function since we don't need to refetch dashboard data here
    };
    
    return (
        <PropertyListingContainer 
            setCurrentStep={() => router.push("/host/listings")} 
            onComplete={handleComplete}
            refetchDashboardData={handleRefetchDashboard}
        />
    );
}