"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@woothomes/components/listing";
import { ApiProperty, useProperties } from "@woothomes/hooks/useProperties";
import { cn } from "@woothomes/lib/utils";
import { Home, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  Checkbox,
} from "@woothomes/components";

interface Filters {
  price: string;
  location: string;
  baths: string;
  bedrooms: string;
  propertyType: string;
  rating: string;
  amenities: string[];
}

interface FilterOption {
  label: string;
  value: string;
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

interface PropertyListingProps {
  searchResults?: {
    properties: ApiProperty[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  } | null;
  searchDescription?: string;
}

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

export const PropertyListing: React.FC<PropertyListingProps> = ({ searchResults, searchDescription }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    price: "",
    location: "",
    baths: "",
    bedrooms: "",
    propertyType: "",
    rating: "",
    amenities: [],
  });

  // Reset current page when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  const appliedFilters = Object.entries(filters).flatMap(([, value]) =>
    Array.isArray(value) ? value : value ? [value] : []
  );

  const { data, isLoading } = useProperties({
    page: currentPage,
    url: "/properties",
  });

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

  // Use search results if available, otherwise use the default data
  const properties = searchResults?.properties || data?.properties || [];
  const meta = searchResults?.meta || data?.meta;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the listing section
    const element = document.querySelector('.property-listing');
    if (element instanceof HTMLElement) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 property-listing">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold">
          {searchResults ? "Search Results" : "Check out our available properties"}
        </h2>
          <FiltersDialog
            filters={filters}
            setFilters={setFilters}
            appliedFilters={appliedFilters}
            clearFilters={clearFilters}
          />
        </div>
        {searchDescription && (
          <p className="text-gray-600 text-lg">{searchDescription}</p>
        )}
        {!searchResults && (
          <div className="flex gap-2">
            {appliedFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => clearFilters(filter)}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200"
              >
                {filter}
                <span className="text-gray-500">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && !searchResults
          ? Array(12)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))
          : properties.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 text-center max-w-2xl mx-auto border border-blue-100">
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-full">
                      <Home className="w-12 h-12 text-blue-900" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-3">
                    No Properties Found
                  </h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    {searchResults 
                      ? "We couldn't find any properties matching your search criteria. Try adjusting your filters or search parameters."
                      : "No properties are currently available. Please check back later or try different search criteria."}
                  </p>
                  {searchResults && (
                    <div className="bg-white/50 rounded-lg p-6 backdrop-blur-sm">
                      <p className="text-blue-900 font-semibold mb-3">Try these suggestions:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                          <span className="text-gray-700">Try a different location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                          <span className="text-gray-700">Adjust your budget range</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                          <span className="text-gray-700">Modify your dates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                          <span className="text-gray-700">Remove some filters</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : properties.map((property: ApiProperty) => (
              <PropertyCard key={property.id} property={property} />
            ))}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={cn(
                  "px-4 py-2 rounded-md",
                  page === currentPage
                    ? "bg-blue-900 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
                onClick={() => handlePageChange(page)}
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
