"use client";

import { PrimaryButton } from "@woothomes/components/ui/primaryButton";
import clsx from "clsx";
import { useRouter } from "next/navigation";

interface ListingHeaderProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    stats?: {
        total_published: number;
        total_unpublished: number;
        total_occupied: number;
        total_daily: number;
        total_hourly: number;
    };
}

export const ListingHeader = ({ activeFilter, setActiveFilter, stats }: ListingHeaderProps) => {
    const router = useRouter();
    
    const filters = [
        { label: "All Properties", count: (stats?.total_published ?? 0) + (stats?.total_unpublished ?? 0) },
        { label: "Published", count: stats?.total_published ?? 0 },
        { label: "Unpublished", count: stats?.total_unpublished ?? 0 },
    ];
    
    return (
        <div className="bg-[#EEEEEE] py-8">
            <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
                        Your Listings
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your properties and create new ones
                    </p>
                </div>

                {/* Filters + Button */}
                <div className="bg-white rounded-lg p-4 sm:p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter.label}
                                onClick={() => setActiveFilter(filter.label)}
                                className={clsx(
                                    "px-4 py-2 text-sm rounded-full border cursor-pointer transition whitespace-nowrap",
                                    activeFilter === filter.label
                                        ? "bg-blue-100 text-blue-800 border-transparent"
                                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                )}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>

                    <div className="w-full sm:w-auto">
                        <PrimaryButton
                            className="w-full sm:w-auto"
                            onClick={() => router.push("/host/create-listing")}
                        >
                            + New Listing
                        </PrimaryButton>
                    </div>
                </div>

                {/* Showing text - simplified */}
                <div className="flex justify-end mb-4">
                    <div className="flex items-center">
                        <span className="font-medium text-[#1e3a8a] whitespace-nowrap text-xl">Showing: {activeFilter}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
