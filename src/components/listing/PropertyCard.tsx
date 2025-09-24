/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { SafeImage } from "@woothomes/components/ui/SafeImage";
import { Heart, MapPin, Users, Bath, Star } from "lucide-react";
import {
  Carousel,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselContent,
} from "@woothomes/components/ui/carousel";
import { formatPrice } from "@woothomes/lib";
import { useRouter } from "next/navigation";
import { ApiProperty } from "@woothomes/hooks/useProperties";
import { Popover, PopoverContent, PopoverTrigger } from "@woothomes/components/ui/popover";

const fallbackImage =
  "http://t0.gstatic.com/licensed-image?q=tbn:ANd9GcQpdvjkMIVFcIwlcGsTOVcjkNVNMyQTJoR3lo1htS2EI-q_LONSV0PHMPGS8f-7ehYKlB16cSMhFEdiEHFvnKk";

// Skeleton loader component for PropertyCard
export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
      </div>

      <div className="p-2">
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>

        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-4"></div>

        <div className="flex justify-between mb-4">
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="h-16 py-2 flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="flex space-x-2 mt-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded flex-1"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
};

export const PropertyCard = ({
  property,
  isLoading = false,
}: {
  property: ApiProperty | null;
  isLoading?: boolean;
}) => {
  // Always initialize hooks at the top level, regardless of conditions
  const [isFavorite, setIsFavorite] = useState(property?.isFavorite ?? false);
  const router = useRouter();

  // Show skeleton while loading
  if (isLoading) {
    return <PropertyCardSkeleton />;
  }

  // Handle null property
  if (!property || typeof property !== "object") {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-red-500">Invalid property data</p>
      </div>
    );
  }

  const gotoPropertyDetails = () => {
    router.push(`/properties/${property.id}`);
  };

  const images =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : [{ image_url: fallbackImage }];

  const allAmenities = property.amenities ?? [];
  const visibleAmenities = allAmenities.slice(0, 3);
  const remainingCount = allAmenities.length > 3 ? allAmenities.length - 3 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <Carousel orientation="horizontal" opts={{ loop: true }}>
          <CarouselContent>
            {images.map((image: any, index) => (
              <CarouselItem key={index} className="relative">
                <div className="h-48 w-full">
                  <SafeImage
                    src={image.image_url}
                    alt={`carousel-image-${index}`}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                    priority={false}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 z-10" />
          <CarouselNext className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 z-10" />
        </Carousel>

        <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded font-bold text-sm">
          {property.price_per_hour && property.price_per_hour > 0 ? (
            <>₦{formatPrice(property.price_per_hour)} <span>Per hour</span></>
          ) : (
            <>₦{formatPrice(property.price_per_night)} <span>Per night</span></>
          )}
        </div>

        <div className="absolute top-0 right-0 p-3">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="text-red-500 focus:outline-none cursor-pointer"
          >
            <Heart fill={isFavorite ? "red" : "none"} size={24} />
          </button>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center text-primary font-bold">
          <h3
            className="cursor-pointer text-lg truncate"
            onClick={gotoPropertyDetails}
          >
            {property.title || "Untitled Property"}
          </h3>
        </div>

        <div className="flex items-center text-gray-500 mb-2">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm truncate">
            {property.city || "City"}, {property.state || "State"},
            {property.country || "Country"}
          </span>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-1" />
            <span className="text-sm">{property.bedrooms || 0} beds</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Bath size={16} className="mr-1" />
            <span className="text-sm">{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm ml-1">{property.rating || "5.0"}</span>
          </div>
        </div>

        <div className="h-16 py-2 flex flex-wrap gap-2 mb-4 overflow-y-auto">
          {visibleAmenities.map((amenity: any, index) => (
            <span
              key={index}
              className="h-6 bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded"
            >
              {amenity.name}
            </span>
          ))}
          
          {remainingCount > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-6 bg-blue-100 text-primary text-xs py-1 px-2 rounded hover:bg-blue-200 transition-colors">
                  +{remainingCount} more
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-2 w-64 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map((amenity: any, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded"
                    >
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            className="cursor-pointer bg-[#06A2E2] hover:bg-[#06A2E2]/90  text-white font-medium py-2 px-4 rounded flex-1"
            onClick={gotoPropertyDetails}
          >
            Book Now
          </button>
          <button
            className="cursor-pointer border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded flex-1 hover:bg-gray-50"
            onClick={() => {
              window.location.href = `/properties/${property.id}?tab=offers`;
            }}
          >
            Make Offer
          </button>
        </div>
      </div>
    </div>
  );
};
