"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, axiosBase } from "@woothomes/lib";

// Category color mapping
const categoryColors = {
  Photography: "from-slate-600 to-slate-700",
  Meetings: "from-blue-600 to-blue-700",
  Events: "from-emerald-600 to-emerald-700",
  Media: "from-indigo-600 to-indigo-700",
  Workshop: "from-violet-600 to-violet-700",
  All: "from-gray-600 to-gray-700"
};

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  rental_type: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  is_hourly_rental: boolean;
  price_per_night: number;
  price_per_hour: number;
  minimum_hours: number;
  maximum_hours: number | null;
  hourly_start_time: string;
  hourly_end_time: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  rating: number | null;
  rating_cleanliness: number | null;
  rating_accuracy: number | null;
  rating_communication: number | null;
  rating_location: number | null;
  rating_check_in: number | null;
  rating_value: number | null;
  reviews_count: number;
  created_at: string;
  updated_at: string;
  images: {
    id: string;
    image_url: string;
    is_primary: boolean;
    tag: string;
  }[];
  amenities: {
    id: string;
    name: string;
    icon: string;
    category: string;
  }[];
  rules: string[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    properties: Property[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      path: string;
      per_page: number;
      to: number;
      total: number;
      has_more_pages: boolean;
    };
  };
}

// Hourly rental card component
const HourlyRentalCard = ({
  id,
  title,
  image,
  category,
  price,
  rating,
  reviews,
}: {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  rating: number | null;
  reviews: number;
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors] || 'from-gray-600 to-gray-700'} text-white/90 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm`}>
          {category}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 truncate text-gray-800">{title}</h3>
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <svg 
                  key={i}
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={i < Math.floor(rating || 0) ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={i < Math.floor(rating || 0) ? 0 : 1.5}
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              ))}
          </div>
          <span className="text-gray-500 text-sm ml-1">
            {rating ? rating.toFixed(1) : 'New'} ({reviews} reviews)
          </span>
        </div>
        <p className="text-blue-600 font-bold text-lg mb-4">
          ₦{formatPrice(price)}/hour
        </p>
        <Link 
          href={`/hourly-rentals/${id}`}
          className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

// Loading skeleton component
const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="relative h-48 bg-gray-200" />
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
};

export default function HourlyRentalsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["All", "Photography", "Meetings", "Events", "Media", "Workshop"];
  
  const itemsPerPage = 6;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const visibleCategories = categories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosBase.get<ApiResponse>(
          '/properties',
          {
            params: {
              rental_type: 'hourly',
              page: 1,
              per_page: 12
            }
          }
        );
        
        // Access the properties array from the nested data structure
        setProperties(data.data.properties || []);
        setError(null);
      } catch (err) {
        setError('Failed to load properties. Please try again later.');
        console.error('Error fetching properties:', err);
        setProperties([]); // Reset properties to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Filter properties based on selected category
  const filteredProperties = selectedCategory === "All" 
    ? properties 
    : properties.filter(property => property.property_type.name === selectedCategory);

  // Ensure filteredProperties is always an array
  const displayProperties = Array.isArray(filteredProperties) ? filteredProperties : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Hourly Rentals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Perfect spaces for photoshoots, meetings, events, and more - rent only for the time you need
          </p>
        </div>

        {/* Categories Section */}
        <div className="relative mb-12">
          <div className="max-w-3xl mx-auto">
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className={`p-2 rounded-full transition-colors ${
                  currentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 flex justify-center items-center gap-3 mx-4">
                {visibleCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === category 
                        ? `bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors] || 'from-gray-600 to-gray-700'} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-white/50`
                        : `bg-white text-gray-600 hover:text-gray-900 shadow-sm hover:shadow-md hover:scale-105 border border-gray-200`
                    }`}
                  >
                    <span className="font-medium text-sm">{category}</span>
                    {selectedCategory === category && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-white/20 rounded-full text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={`p-2 rounded-full transition-colors ${
                  currentPage === totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-label="Next categories"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Page Indicator */}
            <div className="flex justify-center items-center gap-1 mt-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPage === index
                      ? 'bg-blue-600 w-4'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Show loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))
          ) : error ? (
            // Show error message
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : displayProperties.length === 0 ? (
            // Show no results message
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No properties found in this category.</p>
              <button 
                onClick={() => setSelectedCategory("All")}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                View all properties
              </button>
            </div>
          ) : (
            // Show properties
            displayProperties.map((property) => (
              <HourlyRentalCard
                key={property.id}
                id={property.id}
                title={property.title}
                image={property.images.find(img => img.is_primary)?.image_url || property.images[0]?.image_url || '/placeholder-image.jpg'}
                category={property.property_type.name}
                price={property.price_per_hour}
                rating={property.rating}
                reviews={property.reviews_count}
              />
            ))
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-3/5 mb-8 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How Hourly Rentals Work</h2>
              <ol className="space-y-6">
                <li className="flex items-start">
                  <span className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mt-0.5 mr-4 flex-shrink-0 text-lg font-semibold">1</span>
                  <span className="text-gray-700 text-lg">Browse our selection of hourly rental spaces</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mt-0.5 mr-4 flex-shrink-0 text-lg font-semibold">2</span>
                  <span className="text-gray-700 text-lg">Choose your date and specify the hours you need</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mt-0.5 mr-4 flex-shrink-0 text-lg font-semibold">3</span>
                  <span className="text-gray-700 text-lg">Complete your booking and payment securely online</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 mt-0.5 mr-4 flex-shrink-0 text-lg font-semibold">4</span>
                  <span className="text-gray-700 text-lg">Receive your access instructions and enjoy your space</span>
                </li>
              </ol>
            </div>
            <div className="md:w-2/5">
              <div className="relative h-80 w-full rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="How hourly rentals work"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 