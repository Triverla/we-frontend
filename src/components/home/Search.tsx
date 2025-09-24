"use client";

import {
  Calendar,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@woothomes/components";
import { NairaIcon } from "@woothomes/components/ui/icons/NairaIcon";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { axiosBase } from "@woothomes/lib";
import { ApiProperty } from "@woothomes/hooks/useProperties";

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

interface TravelSearchSectionProps {
  onSearchResults: (
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
  ) => void;
}

export const TravelSearchSection = ({ onSearchResults }: TravelSearchSectionProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkoutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const [checkInFormatted, setCheckInFormatted] = useState("");
  const [checkOutFormatted, setCheckOutFormatted] = useState("");

  // Set mounted state after component mounts
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Format dates only after component mounts
  useEffect(() => {
    if (hasMounted) {
      if (checkInDate) {
        setCheckInFormatted(format(checkInDate, "PPP"));
      } else {
        setCheckInFormatted("");
      }
    }
  }, [checkInDate, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      if (checkoutDate) {
        setCheckOutFormatted(format(checkoutDate, "PPP"));
      } else {
        setCheckOutFormatted("");
      }
    }
  }, [checkoutDate, hasMounted]);

  const handleCheckInSelect = (date: Date | Date[] | undefined) => {
    const selectedDate = Array.isArray(date) ? date[0] : date;
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setCheckInDate(selectedDate);
      setCheckInOpen(false);
      // Reset checkout date if it's before the new check-in date
      if (selectedDate && checkoutDate && isBefore(checkoutDate, selectedDate)) {
        setCheckOutDate(undefined);
        setCheckOutFormatted("");
      }
    }
  };

  const handleCheckOutSelect = (date: Date | Date[] | undefined) => {
    const selectedDate = Array.isArray(date) ? date[0] : date;
    if (selectedDate && checkInDate && isBefore(selectedDate, checkInDate)) {
      setError("Check-out date must be after check-in date");
      return;
    }
    setCheckOutDate(selectedDate);
    setCheckOutOpen(false);
    setError(null);
  };

  const generateSearchDescription = () => {
    const parts = [];
    if (location) parts.push(`in ${location}`);
    if (budget) parts.push(`under ₦${Number(budget).toLocaleString()}`);
    if (checkInDate && checkoutDate) {
      parts.push(`from ${format(checkInDate, "MMM d")} to ${format(checkoutDate, "MMM d, yyyy")}`);
    }
    return parts.length > 0 ? `Showing properties ${parts.join(" ")}` : "Showing all properties";
  };

  const handleSearch = async () => {
    if (!hasMounted) return;

    // Validate all required fields
    if (!location) {
      setError("Please enter a location");
      return;
    }
    if (!budget) {
      setError("Please enter your budget");
      return;
    }
    if (!checkInDate) {
      setError("Please select a check-in date");
      return;
    }
    if (!checkoutDate) {
      setError("Please select a check-out date");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate dates
      if (checkInDate && checkoutDate && isBefore(checkoutDate, checkInDate)) {
        setError("Check-out date must be after check-in date");
        setIsLoading(false);
        return;
      }

      // Build search query parameters
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("per_page", "10");
      if (location) params.set("location", location);
      params.set("min_price", "1"); // Always set min price to 1
      if (budget) params.set("max_price", budget);
      if (checkInDate) params.set("check_in", checkInDate.toISOString().split('T')[0]);
      if (checkoutDate) params.set("check_out", checkoutDate.toISOString().split('T')[0]);

      console.log("Search params:", params.toString());
      const response = await axiosBase.get<SearchResponse>(`/properties/search?${params.toString()}`);
      console.log("Search response:", response.data);
      
      if (response.data.success) {
        setHasSearched(true);
        onSearchResults(
          response.data.data.properties, 
          response.data.data.meta,
          generateSearchDescription()
        );
      } else {
        setError(response.data.message || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while fetching properties");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setLocation("");
    setBudget("");
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setCheckInFormatted("");
    setCheckOutFormatted("");
    setError(null);
    setHasSearched(false);
    if (typeof onSearchResults === 'function') {
      onSearchResults(
        [],
        {
          current_page: 1,
          from: 0,
          last_page: 1,
          per_page: 10,
          to: 0,
          total: 0
        },
        null
      );
    }
  };

  // Don't render anything until component is mounted
  if (!hasMounted) {
    return null;
  }

  return (
    <div className="relative w-full -mt-15 z-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1E3A8A]/90 rounded-2xl shadow-2xl p-10 md:p-12 backdrop-blur-sm border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Location Input */}
            <div className="relative">
              <label className="block text-white text-sm font-semibold mb-3">Where to?</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1E3A8A] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Enter location"
                  className="w-full pl-14 pr-4 py-5 rounded-xl bg-white/95 border-2 border-white/40 text-[#1E3A8A] placeholder-[#1E3A8A]/60 focus:border-white focus:ring-2 focus:ring-white/30 transition-all font-medium shadow-lg hover:shadow-xl text-base"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Budget Input */}
            <div className="relative">
              <label className="block text-white text-sm font-semibold mb-3">Budget</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <NairaIcon className="h-6 w-6 text-[#1E3A8A] group-hover:scale-110 transition-transform" />
                </div>
                <Input
                  type="number"
                  placeholder="Max budget"
                  className="w-full pl-14 pr-4 py-5 rounded-xl bg-white/95 border-2 border-white/40 text-[#1E3A8A] placeholder-[#1E3A8A]/60 focus:border-white focus:ring-2 focus:ring-white/30 transition-all font-medium shadow-lg hover:shadow-xl text-base"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            {/* Check In Date */}
            <div className="relative">
              <label className="block text-white text-sm font-semibold mb-3">Check In</label>
              <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                <PopoverTrigger asChild>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarIcon className="h-6 w-6 text-[#1E3A8A] group-hover:scale-110 transition-transform" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Select date"
                      className="w-full pl-14 pr-4 py-5 rounded-xl bg-white/95 border-2 border-white/40 text-[#1E3A8A] placeholder-[#1E3A8A]/60 focus:border-white focus:ring-2 focus:ring-white/30 transition-all cursor-pointer font-medium shadow-lg hover:shadow-xl text-base"
                      value={checkInFormatted}
                      readOnly
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={handleCheckInSelect}
                    disabled={(date) => date < startOfDay(new Date())}
                    initialFocus
                    className="rounded-xl border-2 border-white/40 bg-white shadow-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check Out Date */}
            <div className="relative">
              <label className="block text-white text-sm font-semibold mb-3">Check Out</label>
              <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                <PopoverTrigger asChild>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarIcon className="h-6 w-6 text-[#1E3A8A] group-hover:scale-110 transition-transform" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Select date"
                      className="w-full pl-14 pr-4 py-5 rounded-xl bg-white/95 border-2 border-white/40 text-[#1E3A8A] placeholder-[#1E3A8A]/60 focus:border-white focus:ring-2 focus:ring-white/30 transition-all cursor-pointer font-medium shadow-lg hover:shadow-xl text-base"
                      value={checkOutFormatted}
                      readOnly
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkoutDate}
                    onSelect={handleCheckOutSelect}
                    disabled={(date) => 
                      !checkInDate || 
                      date < startOfDay(checkInDate) || 
                      date < startOfDay(new Date())
                    }
                    initialFocus
                    className="rounded-xl border-2 border-white/40 bg-white shadow-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div className="relative flex items-end gap-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full h-[52px] bg-blue-500 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Search</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="h-[52px] px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 text-red-300 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};
