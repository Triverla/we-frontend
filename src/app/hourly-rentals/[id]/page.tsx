"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@woothomes/components/ui/button";
import { Calendar } from "@woothomes/components/ui/calendar";
import { Input } from "@woothomes/components/ui/input";
import { Label } from "@woothomes/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@woothomes/components/ui/tabs";
import {
  Star,
  Clock,
  MapPin,
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { axiosBase } from "@woothomes/lib";
import { formatPrice } from "@woothomes/lib";
import { useForm } from "react-hook-form";
// import { toast } from "sonner";
import { Modal } from "@woothomes/components/ui/modal";
import { ReviewModal } from "@woothomes/components/properties";
import { faker } from "@faker-js/faker";

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
  max_guests: number;
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
  data: Property;
}

type PropertyOfferFormData = {
  property_id: string;
  proposed_price: number;
  message?: string;
  expires_at: Date;
  booking_dates: Date[];
  start_time: string;
  end_time: string;
};

// Offer type
interface OfferHistoryItem {
  id: string;
  proposed_price: number;
  status: string;
  created_at: string;
  message?: string;
  counter_price?: number;
  booking_dates?: string[];
  start_time?: string;
  end_time?: string;
}

interface Review {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  date: number;
}

// Utility to calculate hour difference
function getHourDifference(start: string, end: string) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh + em / 60 - (sh + sm / 60);
  return diff > 0 ? diff : 0;
}

// Update the safeFormatTime utility to handle both ISO and HH:mm formats
function safeFormatTime(time?: string): string {
  if (!time) return "--:--";

  try {
    // Handle ISO format (e.g., "2025-05-27T10:00:00.000000Z")
    if (time.includes("T")) {
      const date = new Date(time);
      if (isNaN(date.getTime())) return "--:--";
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    // Handle HH:mm format
    if (typeof time === "string" && /^\d{2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return "--:--";
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }

    return "--:--";
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
}

// Utility to extract 'HH:mm' from ISO or HH:mm string
function extractHHmm(time?: string): string {
  if (!time) return "";
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  if (time.includes("T")) {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "";
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  return "";
}

// Default offer percentage settings
const DEFAULT_MIN_OFFER_PERCENTAGE = 70; // 70% of price_per_hour
const DEFAULT_MAX_OFFER_PERCENTAGE = 150; // 150% of price_per_hour

export default function HourlyRentalPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingDatesMain, setBookingDatesMain] = useState<Date[]>([]);
  const [guests, setGuests] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [offerHistory, setOfferHistory] = useState<OfferHistoryItem[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [offerHistoryError, setOfferHistoryError] = useState<string | null>(
    null
  );
  const [hasEditedProposedPrice, setHasEditedProposedPrice] = useState(false);
  const [bookingWithOffer, setBookingWithOffer] =
    useState<OfferHistoryItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOfferConfirmModal, setShowOfferConfirmModal] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isOfferLoading, setIsOfferLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [review, setReview] = useState<Review | null>(null);

  // Memoize the reviews data to prevent unnecessary re-renders
  const reviews = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      name: faker.person.fullName(),
      description:
        "Great hourly rental experience! The space was clean and well-maintained. Perfect for our short meeting. The host was very accommodating with our schedule changes. Would definitely book again for future events.",
      image: faker.image.avatar(),
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      date: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date within last 30 days
    }));
  }, []);

  const {
    register: registerOffer,
    handleSubmit: handleOfferSubmit,
    setValue: setOfferValue,
    formState: { errors: offerErrors, isSubmitting: isSubmittingOffer },
    watch: watchOffer,
    reset: resetOfferForm,
  } = useForm<PropertyOfferFormData>({
    defaultValues: {
      property_id: property?.id || "",
      proposed_price: property?.price_per_hour || 0,
      message: "",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      booking_dates: [],
      start_time: "",
      end_time: "",
    },
    mode: "onChange",
  });

  const watchedProposedPrice = watchOffer("proposed_price");
  const watchedBookingDates = watchOffer("booking_dates");
  const watchedStartTime = watchOffer("start_time");
  const watchedEndTime = watchOffer("end_time");
  const watchedMessage = watchOffer("message");

  // Calculate min/max offer per hour
  const minOfferPerHour = property ? Math.floor(property.price_per_hour * (DEFAULT_MIN_OFFER_PERCENTAGE / 100)) : 0;
  const maxOfferPerHour = property ? Math.ceil(property.price_per_hour * (DEFAULT_MAX_OFFER_PERCENTAGE / 100)) : 0;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosBase.get<ApiResponse>(
          `/properties/${params.id}`
        );
        setProperty(data.data);
        setError(null);
      } catch (err: unknown) {
        setError("Failed to load property details. Please try again later.");
        console.error("Error fetching property:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  useEffect(() => {
    if (property) {
      setOfferValue("property_id", property.id);
      setOfferValue("proposed_price", property.price_per_hour);
    }
  }, [property, setOfferValue]);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!property?.id) return;
      setIsLoadingOffers(true);
      setOfferHistoryError(null);
      try {
        const response = await axiosBase.get(
          `/offers/guest?property_id=${property.id}&per_page=3`
        );
        setOfferHistory(response.data.data || []);
      } catch (err: unknown) {
        console.error("Error fetching offers:", err);
        setOfferHistoryError("Failed to load offer history.");
      } finally {
        setIsLoadingOffers(false);
      }
    };
    fetchOffers();
  }, [property?.id]);

  useEffect(() => {
    if (!property) return;
    // Ensure guests is within valid range when property loads
    setGuests((prev) => {
      const current = Number(prev);
      if (isNaN(current) || current < 1) return 1;
      if (current > property.max_guests) return property.max_guests;
      return current;
    });
  }, [property]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            {error || "Property not found"}
          </p>
          <Link
            href="/hourly-rentals"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Hourly Rentals
          </Link>
        </div>
      </div>
    );
  }

  const hoursPerDayBooking = getHourDifference(startTime, endTime);
  const totalDaysBooking = bookingDatesMain.length;
  const totalPrice =
    property.price_per_hour * hoursPerDayBooking * totalDaysBooking;

  const hoursPerDayOffer = getHourDifference(watchedStartTime, watchedEndTime);
  const totalDaysOffer = watchedBookingDates?.length || 0;
  const totalHoursOffer = hoursPerDayOffer * totalDaysOffer;
  const totalOfferAmountOffer =
    (Number(watchedProposedPrice) || 0) * totalHoursOffer;

  const onSubmitOffer = async (formData: PropertyOfferFormData) => {
    if (
      !formData.booking_dates ||
      formData.booking_dates.length === 0 ||
      !formData.start_time ||
      !formData.end_time
    ) {
      console.error(
        "Please select at least one booking date, start time, and end time."
      );
      return;
    }

    setShowOfferConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/hourly-rentals"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hourly Rentals
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Photo Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div className="relative h-[500px] rounded-2xl overflow-hidden group">
              <Image
                src={
                  property.images[selectedImage]?.image_url ||
                  "/placeholder-image.jpg"
                }
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {property.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedImage === index
                      ? "ring-2 ring-blue-500 scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={`${property.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Booking Section */}
          <div
            id="booking-section"
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
          >
            {bookingWithOffer && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                Booking with accepted offer price:{" "}
                <span className="font-bold">
                  ₦{formatPrice(bookingWithOffer.proposed_price)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-start mb-6">
              <div className="max-w-[70%]">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  {property.rating && (
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-gray-700 font-medium">
                        {property.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">
                      {property.address}, {property.city}, {property.state}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ₦{formatPrice(property.price_per_hour)}
                </p>
                <p className="text-gray-500">per hour</p>
              </div>
            </div>

            <Tabs defaultValue="book" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 rounded-xl">
                <TabsTrigger
                  value="book"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Book Now
                </TabsTrigger>
                <TabsTrigger
                  value="negotiate"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Negotiate Price
                </TabsTrigger>
              </TabsList>

              <TabsContent value="book" className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Flexible Booking
                      </h3>
                      <p className="text-sm text-blue-700">
                        Book for as many hours as you need, with instant
                        confirmation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <Label className="text-gray-700 font-medium mb-3 block">
                    Select Date
                  </Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="multiple"
                      selected={bookingDatesMain}
                      onSelect={(dates) => {
                        if (Array.isArray(dates)) {
                          setBookingDatesMain(dates as Date[]);
                        } else if (dates) {
                          setBookingDatesMain([dates as Date]);
                        } else {
                          setBookingDatesMain([]);
                        }
                      }}
                      className="rounded-xl"
                      classNames={{
                        months:
                          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption:
                          "flex justify-center pt-1 relative items-center text-lg font-medium",
                        caption_label: "text-gray-900",
                        nav: "space-x-1 flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell:
                          "text-gray-500 rounded-md w-9 font-normal text-sm",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                        day_selected:
                          "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                        day_today: "bg-gray-100 text-gray-900",
                        day_outside: "text-gray-400 opacity-50",
                        day_disabled: "text-gray-400 opacity-50",
                        day_range_middle:
                          "aria-selected:bg-blue-50 aria-selected:text-gray-900",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Selected Booking Dates
                  </h4>
                  {bookingDatesMain.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-700 text-sm">
                      {bookingDatesMain.map((date, idx) => (
                        <li key={idx}>{date.toLocaleDateString("en-GB")}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No dates selected.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">
                      Number of Guests
                    </Label>
                    <div className="flex items-center gap-4 mt-2 bg-gray-50 p-2 rounded-lg">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (!property) return;
                          setGuests((prev) => {
                            const current = Number(prev);
                            return Math.max(1, current - 1);
                          });
                        }}
                        className="hover:bg-gray-200"
                        disabled={!property || guests <= 1}
                      >
                        -
                      </Button>
                      <span className="text-lg font-medium min-w-[2rem] text-center">
                        {property
                          ? Math.min(Math.max(1, guests), property.max_guests)
                          : 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (!property) return;
                          setGuests((prev) => {
                            const current = Number(prev);
                            return Math.min(property.max_guests, current + 1);
                          });
                        }}
                        className="hover:bg-gray-200"
                        disabled={!property || guests >= property.max_guests}
                      >
                        +
                      </Button>
                    </div>
                    {property && (
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum {property.max_guests} guests allowed
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">
                      Start Time
                    </Label>
                    <Input
                      type="time"
                      value={startTime}
                      min={property.hourly_start_time}
                      max={property.hourly_end_time}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-lg border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">
                      End Time
                    </Label>
                    <Input
                      type="time"
                      value={endTime}
                      min={property.hourly_start_time}
                      max={property.hourly_end_time}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-lg border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 mt-2"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-gray-700 font-medium">
                    Special Requests (optional)
                  </Label>
                  <Input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    maxLength={1000}
                    className="text-lg border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 mt-2"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        ₦{formatPrice(property.price_per_hour)} ×{" "}
                        {hoursPerDayBooking} hours/day × {totalDaysBooking} days
                      </span>
                      <span className="font-medium">
                        ₦{formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-blue-600">
                        ₦{formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r bg-[#06A2E2]  hover:bg-[#06A2E2]/90 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Book Now
                </Button>
              </TabsContent>

              <TabsContent value="negotiate" className="space-y-6">
                <form
                  onSubmit={handleOfferSubmit(onSubmitOffer)}
                  className="space-y-6"
                >
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-900">
                          Price Negotiation
                        </h3>
                        <p className="text-sm text-green-700">
                          Suggest a price that works for you. The host will
                          review your offer within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">
                      Booking Dates
                    </Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="multiple"
                        selected={watchedBookingDates ?? []}
                        onSelect={(dates) => {
                          if (Array.isArray(dates)) {
                            setOfferValue("booking_dates", dates as Date[]);
                          } else if (dates) {
                            setOfferValue("booking_dates", [dates as Date]);
                          } else {
                            setOfferValue("booking_dates", []);
                          }
                        }}
                        className="rounded-xl"
                      />
                    </div>
                    {offerErrors.booking_dates && (
                      <p className="text-red-500 text-sm mt-1">
                        {offerErrors.booking_dates.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 font-medium">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        {...registerOffer("start_time")}
                        min={property.hourly_start_time}
                        max={property.hourly_end_time}
                        className="text-lg border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 mt-2"
                      />
                      {offerErrors.start_time && (
                        <p className="text-red-500 text-sm mt-1">
                          {offerErrors.start_time.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        {...registerOffer("end_time")}
                        min={property.hourly_start_time}
                        max={property.hourly_end_time}
                        className="text-lg border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 mt-2"
                      />
                      {offerErrors.end_time && (
                        <p className="text-red-500 text-sm mt-1">
                          {offerErrors.end_time.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">
                      Your Proposed Price per Hour
                    </Label>
                    <div className="flex items-center gap-2 mt-2 bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500 font-medium">₦</span>
                      <Input
                        type="number"
                        {...registerOffer("proposed_price", {
                          valueAsNumber: true,
                          min: minOfferPerHour,
                          max: maxOfferPerHour,
                        })}
                        min={minOfferPerHour}
                        max={maxOfferPerHour}
                        className="text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        onFocus={() => setHasEditedProposedPrice(true)}
                        onChange={(e) => {
                          setHasEditedProposedPrice(true);
                          registerOffer("proposed_price").onChange(e);
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your offer must be between ₦{formatPrice(minOfferPerHour)} and ₦{formatPrice(maxOfferPerHour)} per hour.
                    </p>
                    {offerErrors.proposed_price && (
                      <p className="text-red-500 text-sm mt-1">
                        {offerErrors.proposed_price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">
                      Message (optional)
                    </Label>
                    <Input
                      type="text"
                      {...registerOffer("message")}
                      maxLength={1000}
                      className="text-lg border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {offerErrors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {offerErrors.message.message}
                      </p>
                    )}
                  </div>
                  {hasEditedProposedPrice &&
                    Number(watchedProposedPrice) > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Offer Summary
                        </h4>
                        <div className="flex flex-col gap-2 text-gray-700 text-sm">
                          <div className="flex justify-between">
                            <span>Proposed Price per Hour:</span>
                            <span className="font-medium text-blue-600">
                              ₦{formatPrice(Number(watchedProposedPrice) || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hours per Day:</span>
                            <span className="font-medium">
                              {hoursPerDayOffer}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Number of Days:</span>
                            <span className="font-medium">
                              {totalDaysOffer}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Hours:</span>
                            <span className="font-medium">
                              {totalHoursOffer}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span>Total Offer Amount:</span>
                            <span className="font-bold text-green-600">
                              ₦{formatPrice(totalOfferAmountOffer)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmittingOffer}
                  >
                    {isSubmittingOffer ? "Sending..." : "Send Price Offer"}
                  </Button>
                </form>
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Offer History
                  </h4>
                  {isLoadingOffers ? (
                    <div className="py-4 text-gray-500">Loading...</div>
                  ) : offerHistoryError ? (
                    <div className="py-4 text-red-500">{offerHistoryError}</div>
                  ) : offerHistory.length === 0 ? (
                    <div className="py-4 text-gray-500">
                      No previous offers yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {offerHistory.map((offer) => (
                        <li key={offer.id} className="py-3 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              ₦{formatPrice(offer.proposed_price)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                              {offer.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(offer.created_at).toLocaleString()}
                          </div>
                          {offer.message && (
                            <div className="text-xs text-gray-600">
                              Message: {offer.message}
                            </div>
                          )}
                          {offer.counter_price && (
                            <div className="text-xs text-blue-600">
                              Host Counter: ₦{formatPrice(offer.counter_price)}
                            </div>
                          )}
                          {offer.status === "accepted" && (
                            <Button
                              size="sm"
                              className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => {
                                setBookingWithOffer(offer);
                                setShowConfirmModal(true);
                              }}
                            >
                              Book with Accepted Price
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About this space
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    What guests are saying
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-gray-700 font-medium">
                        {property.rating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ({property.reviews_count || reviews.length} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border rounded-md py-3 px-3">
                  <span className="text-sm text-gray-600">Most recent</span>
                  <div className="text-xs px-2 py-1">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review: Review, index: number) => (
                  <div
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow border border-gray-100 rounded-xl p-6"
                    onClick={() => {
                      setReview(review);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={review?.image || "/images/fallback-avatar.jpg"}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.name}
                        </p>
                        <div className="flex gap-1 text-yellow-500">
                          {"⭐".repeat(review.rating)}
                        </div>
                      </div>
                      <p className="ml-auto text-xs text-gray-500">
                        {Math.floor(
                          (Date.now() - review.date) / (1000 * 60 * 60 * 24)
                        )}{" "}
                        days ago
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.description.substring(0, 120)}...
                      <span className="text-blue-500 font-semibold">
                        Read more...
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Host Information
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-500">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt={property.user?.name || "Host"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {property.user?.name || "Host"}
                  </h3>
                  <p className="text-gray-600">
                    Host since {new Date(property.created_at).getFullYear()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                className="w-full py-6 text-lg text-blue-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Contact Host
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => (isBookingLoading ? null : setShowConfirmModal(false))}
        header="Confirm Your Booking"
        message={
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-2">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                <Clock className="w-6 h-6 text-blue-500" />
              </span>
            </div>
            <div className="text-left space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Dates:</span>
                <span className="ml-2">
                  {bookingWithOffer
                    ? bookingWithOffer.booking_dates
                        ?.map((d) => new Date(d).toLocaleDateString("en-GB"))
                        .join(", ")
                    : bookingDatesMain
                        .map((d) => d.toLocaleDateString("en-GB"))
                        .join(", ")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Start Time:</span>
                <span className="ml-2">
                  {bookingWithOffer
                    ? safeFormatTime(bookingWithOffer.start_time)
                    : safeFormatTime(startTime)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">End Time:</span>
                <span className="ml-2">
                  {bookingWithOffer
                    ? safeFormatTime(bookingWithOffer.end_time)
                    : safeFormatTime(endTime)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Guests:</span>
                <span className="ml-2">{guests}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Price</span>
                <span className="text-blue-600">
                  ₦
                  {formatPrice(
                    bookingWithOffer
                      ? bookingWithOffer.proposed_price
                      : totalPrice
                  )}
                </span>
              </div>
            </div>
          </div>
        }
        buttons={[
          {
            label: "Confirm Booking",
            onClick: async () => {
              setIsBookingLoading(true);
              try {
                let bookingPayload;
                if (bookingWithOffer) {
                  const start = extractHHmm(bookingWithOffer.start_time);
                  const end = extractHHmm(bookingWithOffer.end_time);
                  const numDays = bookingWithOffer.booking_dates?.length || 0;
                  const [sh, sm] = start.split(":").map(Number);
                  const [eh, em] = end.split(":").map(Number);
                  let hours = eh + em / 60 - (sh + sm / 60);
                  if (hours < 0) hours = 0;
                  const hoursBooked = Math.round(hours * numDays);
                  bookingPayload = {
                    guests_count: guests,
                    total_price: bookingWithOffer.proposed_price,
                    special_requests: specialRequests,
                    booking_dates: bookingWithOffer.booking_dates,
                    start_time: start,
                    end_time: end,
                    hours_booked: hoursBooked,
                  };
                } else {
                  bookingPayload = {
                    guests_count: guests,
                    total_price: totalPrice,
                    special_requests: specialRequests,
                    booking_dates: bookingDatesMain.map(
                      (d) => d.toISOString().split("T")[0]
                    ),
                    start_time: startTime,
                    end_time: endTime,
                    hours_booked: hoursPerDayBooking * totalDaysBooking,
                  };
                }
                const response = await axiosBase.post(
                  `/properties/${property.id}/bookings`,
                  bookingPayload
                );
                console.log("Booking response:", response);
                const checkoutUrl = response?.data?.data?.checkout_url;
                if (checkoutUrl) {
                  window.location.href = checkoutUrl;
                  return;
                }
                // toast.success("Booking successful!");
                // const bookingId = response?.data?.data?.id;
                // if (bookingId) {
                //   router.push(`/properties/payment?booking=${bookingId}`);
                // } else {
                //   router.push("/properties/payment");
                // }
                setShowConfirmModal(false);
              } catch (error: unknown) {
                if (
                  error &&
                  typeof error === "object" &&
                  "response" in error &&
                  error.response &&
                  typeof error.response === "object" &&
                  "data" in error.response &&
                  error.response.data &&
                  typeof error.response.data === "object" &&
                  "message" in error.response.data
                ) {
                  console.error(
                    (error.response.data as { message?: string }).message ||
                      "Booking failed. Please try again."
                  );
                } else {
                  console.error("Booking failed. Please try again.");
                }
              } finally {
                setIsBookingLoading(false);
              }
            },
            variant: "primary",
            isLoading: isBookingLoading,
            disabled: isBookingLoading,
          },
          {
            label: "Cancel",
            onClick: () => setShowConfirmModal(false),
            variant: "secondary",
            disabled: isBookingLoading,
          },
        ]}
      />

      <Modal
        isOpen={showOfferConfirmModal}
        onClose={() =>
          isOfferLoading ? null : setShowOfferConfirmModal(false)
        }
        header="Confirm Your Offer"
        message={
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-2">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </span>
            </div>
            <div className="text-left space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Dates:</span>
                <span className="ml-2">
                  {watchedBookingDates
                    ?.map((d) => d.toLocaleDateString("en-GB"))
                    .join(", ")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Start Time:</span>
                <span className="ml-2">{safeFormatTime(watchedStartTime)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">End Time:</span>
                <span className="ml-2">{safeFormatTime(watchedEndTime)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Proposed Price per Hour:
                </span>
                <span className="ml-2">
                  ₦{formatPrice(Number(watchedProposedPrice) || 0)}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Offer Amount</span>
                <span className="text-green-600">
                  ₦{formatPrice(totalOfferAmountOffer)}
                </span>
              </div>
            </div>
          </div>
        }
        buttons={[
          {
            label: "Confirm Offer",
            onClick: async () => {
              setIsOfferLoading(true);
              setShowOfferConfirmModal(false);
              try {
                await axiosBase.post("/offers", {
                  property_id: property?.id,
                  proposed_price: Number(watchedProposedPrice),
                  message: watchedMessage,
                  expires_at: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                  ).toISOString(),
                  booking_dates: watchedBookingDates?.map(
                    (d) => new Date(d).toISOString().split("T")[0]
                  ),
                  start_time: safeFormatTime(watchedStartTime),
                  end_time: safeFormatTime(watchedEndTime),
                  total_hours: totalHoursOffer,
                  total_offer: totalOfferAmountOffer,
                });
                // toast.success("Your offer has been submitted successfully!");
                resetOfferForm();
                setOfferValue("property_id", property?.id || "");
                setOfferValue("proposed_price", property?.price_per_hour || 0);
              } catch (error: unknown) {
                if (
                  error &&
                  typeof error === "object" &&
                  "response" in error &&
                  error.response &&
                  typeof error.response === "object" &&
                  "data" in error.response &&
                  error.response.data &&
                  typeof error.response.data === "object" &&
                  "errors" in error.response.data
                ) {
                  Object.values(
                    (
                      error.response.data as {
                        errors: Record<string, string[]>;
                      }
                    ).errors
                  ).forEach((messages) => {
                    (messages as string[]).forEach((msg) => console.error(msg));
                  });
                } else if (
                  error &&
                  typeof error === "object" &&
                  "response" in error &&
                  error.response &&
                  typeof error.response === "object" &&
                  "data" in error.response &&
                  error.response.data &&
                  typeof error.response.data === "object" &&
                  "message" in error.response.data
                ) {
                  console.error(
                    (error.response.data as { message?: string }).message ||
                      "Failed to submit offer. Please try again."
                  );
                } else {
                  console.error("Failed to submit offer. Please try again.");
                }
              } finally {
                setIsOfferLoading(false);
              }
            },
            variant: "primary",
            isLoading: isOfferLoading,
            disabled: isOfferLoading,
          },
          {
            label: "Cancel",
            onClick: () => setShowOfferConfirmModal(false),
            variant: "secondary",
            disabled: isOfferLoading,
          },
        ]}
      />

      <ReviewModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        review={
          review
            ? {
                ...review,
                image: review.image || "/images/fallback-avatar.jpg",
              }
            : null
        }
      />
    </div>
  );
}
