"use client";

import { ApiProperty } from "@woothomes/hooks/useProperties";
import { PropertyCard } from "@woothomes/components/listing";

interface SearchResultsProps {
  properties: ApiProperty[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export const SearchResults = ({ properties, meta }: SearchResultsProps) => {
  if (!properties.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No properties found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Found {meta.total} properties
        </h2>
        <p className="text-gray-600">
          Showing {meta.from} to {meta.to} of {meta.total} results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>

      {meta.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-md ${
                  page === meta.current_page
                    ? "bg-blue-900 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => {
                  // Handle page change
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 