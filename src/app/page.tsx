"use client";

import { useState } from "react";
import {
  HeroSection,
  TravelSearchSection,
  PropertyListing,
  PropertyTypesSection,
  LocationsSection,
  HourlyRentalsSection,
  PriceNegotiationSection,
  AdditionalServicesSection,
} from "@woothomes/components";
import { ApiProperty } from "@woothomes/hooks/useProperties";

export default function Home() {
  const [searchResults, setSearchResults] = useState<{
    properties: ApiProperty[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  } | null>(null);
  const [searchDescription, setSearchDescription] = useState<string>("");

  const handleSearchResults = (
    properties: ApiProperty[],
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    },
    description: string | null
  ) => {
    if (description === null) {
      setSearchResults(null);
      setSearchDescription("");
    } else {
    setSearchResults({ properties, meta });
    setSearchDescription(description);
    }
  };

  return (
    <div className="flex flex-col min-h-screen gap-0 font-montserrat bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800">
      <main className="flex flex-col gap-0 items-center sm:items-start text-center sm:text-left flex-grow">
        <HeroSection />
        <TravelSearchSection onSearchResults={handleSearchResults} />
        <div className="my-12 w-full">
          <PropertyListing searchResults={searchResults} searchDescription={searchDescription} />
        </div>
        <PropertyTypesSection />
        <LocationsSection />
        <HourlyRentalsSection />
        <PriceNegotiationSection />
        <AdditionalServicesSection />
      </main>
    </div>
  );
}
