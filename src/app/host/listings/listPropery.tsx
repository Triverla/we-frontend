"use client";

import { PropertyCard, PropertyCardSkeleton } from "./hostPropertyCard";
import { useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@woothomes/components";
import { useState } from "react";
import { PrimaryButton } from "@woothomes/components/ui/primaryButton";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useProperties,
  useDeleteProperty,
} from "@woothomes/hooks/useProperties";
// import { toast } from "sonner";
import { Skeleton } from "@woothomes/components/ui/skeleton";
import { useHostPropertiesStore } from "@woothomes/store";

interface ListpropertyProps {
  filter: string;
}

export const Listproperty = ({ filter }: ListpropertyProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { isLoading, isError } = useProperties({ page: currentPage, filter });

  const deletePropertyMutation = useDeleteProperty();

  const { properties, meta } = useHostPropertiesStore();
  console.log({properties})


  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= meta?.last_page) {
      setCurrentPage(page);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await deletePropertyMutation.mutateAsync(id.toString());
      // toast.success("Property deleted successfully");
    } catch {
      console.error("Failed to delete property");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#EEEEEE]">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
          </div>

          <div className="mt-8 sm:mt-12 flex justify-center">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !properties) {
    return (
      <div className="bg-[#EEEEEE] min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">
          Error loading properties. Please try again.
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-[#EEEEEE] min-h-screen">
        <div className="w-full max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <Home className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Properties Found
            </h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t listed any properties yet. Start by creating your
              first property listing.
            </p>
            <PrimaryButton
              onClick={() => router.push("/host/listings")}
              className="px-6 py-3"
            >
              Create Your First Listing
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EEEEEE]">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={() => handleDeleteProperty(property.id)}
            />
          ))}
        </div>

        <Pagination className="mt-8 sm:mt-12">
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={`cursor-pointer rounded-md ${
              currentPage === 1 ? "opacity-50 pointer-events-none" : ""
            }`}
          />
          <PaginationContent>
            {/* Show first 3 pages or sliding window if currentPage > 2 */}
            {(() => {
              const pageItems = [];
              const maxVisible = 3;
              const startPage = Math.max(
                1,
                Math.min(currentPage - 1, meta?.last_page - maxVisible + 1)
              );

              for (let i = 0; i < Math.min(meta?.last_page, maxVisible); i++) {
                const page = startPage + i;
                const isCurrent = page === currentPage;

                pageItems.push(
                  <PaginationItem key={page} className="rounded-md border-0">
                    <PaginationLink
                      isActive={isCurrent}
                      className={`cursor-pointer outline-none border-0`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return pageItems;
            })()}

            {/* Ellipsis and last page if more than 3 pages and we're not already showing the last */}
            {meta?.last_page > 3 && currentPage < meta?.last_page - 1 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem
                  className={
                    currentPage === meta?.last_page ? "bg-[#06A2E2] rounded-md" : ""
                  }
                >
                  <PaginationLink
                    className={`cursor-pointer outline-none ${
                      currentPage === meta?.last_page ? "text-white" : ""
                    }`}
                    onClick={() => handlePageChange(meta?.last_page)}
                  >
                    {meta?.last_page}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
          </PaginationContent>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={`cursor-pointer ${
              currentPage === meta?.last_page ? "opacity-50 pointer-events-none" : ""
            }`}
          />
        </Pagination>
      </div>
    </div>
  );
};
