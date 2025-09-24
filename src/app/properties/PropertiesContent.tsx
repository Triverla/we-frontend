"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCard } from "@woothomes/components/listing";
import { axiosBase } from "@woothomes/lib";
import { ApiProperty } from "@woothomes/hooks/useProperties";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
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
  location: string;
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
              { label: "Under N$0,000", value: "under-0k" },
              { label: "Under N$50,000", value: "under-50k" },
              { label: "Under N$100,000", value: "under-100k" },
            ]}
          />
          <FilterSelect
            label="Location"
            value={filters.location}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, location: val }))
            }
            options={[
              { label: "Abuja", value: "abuja" },
              { label: "Lagos", value: "lagos" },
              { label: "Port Harcourt", value: "ph" },
            ]}
          />
          <FilterSelect
            label="Baths"
            value={filters.baths}
            onChange={(val) => setFilters((prev) => ({ ...prev, baths: val }))}
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3+", value: "3plus" },
            ]}
          />
          <FilterSelect
            label="Bedrooms"
            value={filters.bedrooms}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, bedrooms: val }))
            }
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3+", value: "3plus" },
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
              { label: "Studio", value: "studio" },
            ]}
          />
          <FilterSelect
            label="Rating"
            value={filters.rating}
            onChange={(val) => setFilters((prev) => ({ ...prev, rating: val }))}
            options={[
              { label: "1 Star", value: "1" },
              { label: "2 Stars", value: "2" },
              { label: "3 Stars", value: "3" },
              { label: "4 Stars", value: "4" },
              { label: "5 Stars", value: "5" },
            ]}
          />
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium">Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {amenities.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={() => handleCheckboxChange(amenity)}
                />
                <span className="font-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-row w-full justify-center">
          <div className="w-full flex justify-center gap-8 mx-8 my-8">
            <Button
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex-1"
              onClick={() =>
                setFilters({
                  price: "",
                  location: "",
                  baths: "",
                  bedrooms: "",
                  propertyType: "",
                  rating: "",
                  amenities: [],
                })
              }
            >
              Search Places
            </Button>
            <Button
              className="cursor-pointer border border-gray-300 text-gray-700 font-medium py-2 px-2 rounded flex-1 bg-gray-50 hover:text-white"
              onClick={() =>
                setFilters({
                  price: "",
                  location: "",
                  baths: "",
                  bedrooms: "",
                  propertyType: "",
                  rating: "",
                  amenities: [],
                })
              }
            >
              Reset
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
// Pagination Component

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const visiblePages = 3;
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  return (
    <div className="flex justify-center mt-12">
      <Pagination className="flex items-center">
        <PaginationPrevious
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            "cursor-pointer",
            currentPage === 1 && "opacity-50 pointer-events-none"
          )}
        >
          <ChevronLeft />
        </PaginationPrevious>

        <PaginationContent>
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  isActive={1 === currentPage}
                  onClick={() => onPageChange(1)}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {[...Array(endPage - startPage + 1)].map((_, i) => {
            const page = startPage + i;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  isActive={totalPages === currentPage}
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
        </PaginationContent>

        <PaginationNext
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            "cursor-pointer",
            currentPage === totalPages && "opacity-50 pointer-events-none"
          )}
        >
          <ChevronRight />
        </PaginationNext>
      </Pagination>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component

export function PropertiesContent() {
  const searchParams = useSearchParams();
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
    location: "",
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
      location: prev.location === tag ? "" : prev.location,
      baths: prev.baths === tag ? "" : prev.baths,
      bedrooms: prev.bedrooms === tag ? "" : prev.bedrooms,
      propertyType: prev.propertyType === tag ? "" : prev.propertyType,
      rating: prev.rating === tag ? "" : prev.rating,
    }));
  };

  useEffect(() => {
    if (!mounted) return;

    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const location = searchParams?.get("location");
        const checkIn = searchParams?.get("check_in");
        const checkOut = searchParams?.get("check_out");
        const minPrice = searchParams?.get("min_price");
        const maxPrice = searchParams?.get("max_price");

        // Check if any search parameters exist
        const hasSearchParams = location || checkIn || checkOut || minPrice || maxPrice;

        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("per_page", "10");

        if (hasSearchParams) {
          // Only add search parameters if they exist
          if (location) params.set("location", location);
          if (checkIn) params.set("check_in", checkIn);
          if (checkOut) params.set("check_out", checkOut);
          if (minPrice) params.set("min_price", minPrice);
          if (maxPrice) params.set("max_price", maxPrice);

          // Use search endpoint only when search parameters exist
          const response = await axiosBase.get<SearchResponse>("/properties/search", {
            params
          });
          
          if (response.data.success) {
            setProperties(response.data.data.properties);
            setMeta(response.data.data.meta);
          } else {
            setError(response.data.message || "Failed to fetch properties");
          }
        } else {
          // Use regular properties endpoint when no search parameters
          const response = await axiosBase.get<SearchResponse>("/properties", {
            params
          });
          
          if (response.data.success) {
            setProperties(response.data.data.properties);
            setMeta(response.data.data.meta);
          } else {
            setError(response.data.message || "Failed to fetch properties");
          }
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("An error occurred while fetching properties. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, currentPage, mounted]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

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

  if (properties.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
          <p className="text-gray-600">
            Try adjusting your search criteria to find more properties.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold">
          Check out our available <br /> properties
        </h2>
        <FiltersDialog
          filters={filters}
          setFilters={setFilters}
          appliedFilters={appliedFilters}
          clearFilters={clearFilters}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <CustomPagination
        currentPage={currentPage}
        totalPages={meta.last_page}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 