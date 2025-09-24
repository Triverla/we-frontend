"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PropertyCard } from "@woothomes/components/listing";
import { axiosBase } from "@woothomes/lib";
import { ApiProperty } from "@woothomes/hooks/useProperties";
import { SlidersHorizontal, MapPin } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  Checkbox,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@woothomes/components";
import { cn } from "@woothomes/lib/utils";

// ─────────────────────────────────────────────
// Interfaces

interface FilterOption {
  label: string;
  value: string;
}

interface Filters {
  price: string;
  baths: string;
  bedrooms: string;
  propertyType: string;
  rating: string;
  amenities: string[];
}

interface FilterSelectProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FiltersDialogProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  appliedFilters: string[];
  clearFilters: (tag: string) => void;
}

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    properties: ApiProperty[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

// ─────────────────────────────────────────────
// Reusable FilterSelect Component

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <div className="w-full">
    <label className="block mb-1 text-sm">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="w-full">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// ─────────────────────────────────────────────
// FiltersDialog Component

const FiltersDialog: React.FC<FiltersDialogProps> = ({
  filters,
  setFilters,
  appliedFilters,
  clearFilters,
}) => {
  const amenities = [
    "Wifi",
    "Pool",
    "Parking",
    "Gym",
    "Air Conditioning",
    "Pet Friendly",
    "Elevator",
    "Garden",
  ];

  const handleCheckboxChange = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="cursor-pointer">
          <SlidersHorizontal />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Select your preferred options</DialogDescription>
        </DialogHeader>

        {/* Applied Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {appliedFilters.length > 0 ? (
            appliedFilters.map((tag) => (
              <span
                key={tag}
                className="bg-muted px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => clearFilters(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No filters applied
            </span>
          )}
        </div>

        {/* Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FilterSelect
            label="Price"
            value={filters.price}
            onChange={(val) => setFilters((prev) => ({ ...prev, price: val }))}
            options={[
              { label: "Under ₦50,000", value: "under-50k" },
              { label: "Under ₦100,000", value: "under-100k" },
              { label: "Under ₦200,000", value: "under-200k" },
              { label: "Under ₦500,000", value: "under-500k" },
            ]}
          />
          <FilterSelect
            label="Bedrooms"
            value={filters.bedrooms}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, bedrooms: val }))
            }
            options={[
              { label: "1 Bedroom", value: "1" },
              { label: "2 Bedrooms", value: "2" },
              { label: "3 Bedrooms", value: "3" },
              { label: "4+ Bedrooms", value: "4+" },
            ]}
          />
          <FilterSelect
            label="Bathrooms"
            value={filters.baths}
            onChange={(val) => setFilters((prev) => ({ ...prev, baths: val }))}
            options={[
              { label: "1 Bathroom", value: "1" },
              { label: "2 Bathrooms", value: "2" },
              { label: "3+ Bathrooms", value: "3+" },
            ]}
          />
          <FilterSelect
            label="Property Type"
            value={filters.propertyType}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, propertyType: val }))
            }
            options={[
              { label: "Apartment", value: "apartment" },
              { label: "House", value: "house" },
              { label: "Villa", value: "villa" },
              { label: "Condo", value: "condo" },
            ]}
          />
          <FilterSelect
            label="Rating"
            value={filters.rating}
            onChange={(val) => setFilters((prev) => ({ ...prev, rating: val }))}
            options={[
              { label: "4+ Stars", value: "4+" },
              { label: "3+ Stars", value: "3+" },
              { label: "2+ Stars", value: "2+" },
            ]}
          />
        </div>

        {/* Amenities */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={() => handleCheckboxChange(amenity)}
                />
                <label
                  htmlFor={amenity}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() =>
              setFilters({
                price: "",
                baths: "",
                bedrooms: "",
                propertyType: "",
                rating: "",
                amenities: [],
              })
            }
            variant="outline"
          >
            Clear All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
// Custom Pagination Component

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={cn(
              "cursor-pointer",
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "cursor-pointer",
                  currentPage === page && "bg-[#1E3A8A] text-white"
                )}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={cn(
              "cursor-pointer",
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

// ─────────────────────────────────────────────
// Main Component

export default function LocationPropertiesPage() {
  const params = useParams();
  const location = params.location as string;
  
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [meta, setMeta] = useState<SearchResponse["data"]["meta"]>({
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 10,
    to: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    price: "",
    baths: "",
    bedrooms: "",
    propertyType: "",
    rating: "",
    amenities: [],
  });

  // Handle client-side initialization
  useEffect(() => {
    setMounted(true);
  }, []);

  const appliedFilters = Object.entries(filters).flatMap(([, value]) =>
    Array.isArray(value) ? value : value ? [value] : []
  );

  const clearFilters = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== tag),
      price: prev.price === tag ? "" : prev.price,
      baths: prev.baths === tag ? "" : prev.baths,
      bedrooms: prev.bedrooms === tag ? "" : prev.bedrooms,
      propertyType: prev.propertyType === tag ? "" : prev.propertyType,
      rating: prev.rating === tag ? "" : prev.rating,
    }));
  };

  useEffect(() => {
    if (!mounted || !location) return;

    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("per_page", "12");
        params.set("city", location);

        // Add filter parameters
        if (filters.price) {
          const priceMap: { [key: string]: string } = {
            "under-50k": "50000",
            "under-100k": "100000",
            "under-200k": "200000",
            "under-500k": "500000",
          };
          params.set("max_price", priceMap[filters.price] || "");
        }
        if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
        if (filters.baths) params.set("bathrooms", filters.baths);
        if (filters.propertyType) params.set("property_type", filters.propertyType);
        if (filters.rating) params.set("rating", filters.rating);
        if (filters.amenities.length > 0) {
          params.set("amenities", filters.amenities.join(","));
        }

        const response = await axiosBase.get<SearchResponse>("/properties", {
          params
        });
        
        if (response.data.success) {
          setProperties(response.data.data.properties);
          setMeta(response.data.data.meta);
        } else {
          setError(response.data.message || "Failed to fetch properties");
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("An error occurred while fetching properties. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [location, currentPage, mounted, filters]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Format location name for display
  const formatLocationName = (location: string) => {
    return location
      .split("-")
      .map(word => {
        // Convert special characters to their equivalent symbols
        const convertedWord = word
          .replace(/20/g, ' ') // Convert 20 to space
          .replace(/2/g, ' ') // Convert 2 to space
          .replace(/3/g, ' ') // Convert 3 to space
          .replace(/4/g, ' ') // Convert 4 to space
          .replace(/5/g, ' ') // Convert 5 to space
          .replace(/6/g, ' ') // Convert 6 to space
          .replace(/7/g, ' ') // Convert 7 to space
          .replace(/8/g, ' ') // Convert 8 to space
          .replace(/9/g, ' ') // Convert 9 to space
          .replace(/0/g, ' ') // Convert 0 to space
          .replace(/@/g, ' ') // Convert @ to space
          .replace(/#/g, ' ') // Convert # to space
          .replace(/\$/g, ' ') // Convert $ to space
          .replace(/%/g, ' ') // Convert % to space
          .replace(/\^/g, ' ') // Convert ^ to space
          .replace(/&/g, ' ') // Convert & to space
          .replace(/\*/g, ' ') // Convert * to space
          .replace(/\(/g, ' ') // Convert ( to space
          .replace(/\)/g, ' ') // Convert ) to space
          .replace(/_/g, ' ') // Convert _ to space
          .replace(/\+/g, ' ') // Convert + to space
          .replace(/=/g, ' ') // Convert = to space
          .replace(/\[/g, ' ') // Convert [ to space
          .replace(/\]/g, ' ') // Convert ] to space
          .replace(/\{/g, ' ') // Convert { to space
          .replace(/\}/g, ' ') // Convert } to space
          .replace(/\|/g, ' ') // Convert | to space
          .replace(/;/g, ' ') // Convert ; to space
          .replace(/:/g, ' ') // Convert : to space
          .replace(/"/g, ' ') // Convert " to space
          .replace(/'/g, ' ') // Convert ' to space
          .replace(/,/g, ' ') // Convert , to space
          .replace(/\./g, ' ') // Convert . to space
          .replace(/\//g, ' ') // Convert / to space
          .replace(/</g, ' ') // Convert < to space
          .replace(/>/g, ' ') // Convert > to space
          .replace(/\?/g, ' ') // Convert ? to space
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim(); // Remove leading/trailing spaces
        
        return convertedWord.charAt(0).toUpperCase() + convertedWord.slice(1);
      })
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#EEEEEE] min-h-screen">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-[#1E3A8A]" />
            <h1 className="text-3xl font-bold text-[#1E3A8A]">
              Properties in {formatLocationName(location)}
            </h1>
          </div>
          <p className="text-gray-600">
            {meta.total} properties found in {formatLocationName(location)}
          </p>
        </div>

        {/* Filters and Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg p-6 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <FiltersDialog
                  filters={filters}
                  setFilters={setFilters}
                  appliedFilters={appliedFilters}
                  clearFilters={clearFilters}
                />
              </div>

              {/* Applied Filters */}
              {appliedFilters.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Applied Filters:</h3>
                  <div className="flex flex-wrap gap-2">
                    {appliedFilters.map((filter) => (
                      <span
                        key={filter}
                        className="bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      >
                        {filter}
                        <button
                          onClick={() => clearFilters(filter)}
                          className="text-[#1E3A8A] hover:text-[#1E3A8A]/70"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div className="space-y-4">
                <FilterSelect
                  label="Price"
                  value={filters.price}
                  onChange={(val) => setFilters((prev) => ({ ...prev, price: val }))}
                  options={[
                    { label: "Under ₦50,000", value: "under-50k" },
                    { label: "Under ₦100,000", value: "under-100k" },
                    { label: "Under ₦200,000", value: "under-200k" },
                    { label: "Under ₦500,000", value: "under-500k" },
                  ]}
                />
                <FilterSelect
                  label="Bedrooms"
                  value={filters.bedrooms}
                  onChange={(val) =>
                    setFilters((prev) => ({ ...prev, bedrooms: val }))
                  }
                  options={[
                    { label: "1 Bedroom", value: "1" },
                    { label: "2 Bedrooms", value: "2" },
                    { label: "3 Bedrooms", value: "3" },
                    { label: "4+ Bedrooms", value: "4+" },
                  ]}
                />
                <FilterSelect
                  label="Bathrooms"
                  value={filters.baths}
                  onChange={(val) => setFilters((prev) => ({ ...prev, baths: val }))}
                  options={[
                    { label: "1 Bathroom", value: "1" },
                    { label: "2 Bathrooms", value: "2" },
                    { label: "3+ Bathrooms", value: "3+" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:w-3/4">
            {properties.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
                <p className="text-gray-600">
                  Try adjusting your filters to find more properties in {formatLocationName(location)}.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {meta.last_page > 1 && (
                  <div className="mt-8 flex justify-center">
                    <CustomPagination
                      currentPage={currentPage}
                      totalPages={meta.last_page}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 