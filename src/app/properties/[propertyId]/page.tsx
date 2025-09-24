"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@woothomes/components/ui/tabs";
import { SafeImage } from "@woothomes/components/ui/SafeImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@woothomes/components/ui/carousel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@woothomes/components/ui/card";
import { Button } from "@woothomes/components/ui/button";

import { ReviewModal } from "@woothomes/components/properties";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { axiosBase, CheckPropertyAvailabilitySchema } from "@woothomes/lib";
// import { toast } from "sonner";
import { useProperty } from "@woothomes/hooks/useProperties";
import { Skeleton } from "@woothomes/components/ui/skeleton";
import {
  Calendar,
  FormInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@woothomes/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@woothomes/components/ui/dialog";
import { useAuthStore } from "@woothomes/store";
import { faker } from "@faker-js/faker";
import axios from "axios";
import { useCreateConversation } from "@woothomes/hooks";

interface Offer {
  id: string;
  property_id: string;
  proposed_price: number | string;
  status: string;
  created_at: string;
  check_in: string;
  check_out: string;
  message?: string;
  counter_price?: number | string;
  counter_offer?: number | string;
  // Add any other fields your offer objects have
}

// Update the schema to validate checkout date is after checkin date
const CustomCheckPropertyAvailabilitySchema =
  CheckPropertyAvailabilitySchema.refine(
    (data) => {
      const checkIn = new Date(data.check_in_date);
      const checkOut = new Date(data.check_out_date);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["check_out_date"],
    }
  );

type CheckPropertyAvailabilityFormData = z.infer<
  typeof CustomCheckPropertyAvailabilitySchema
>;

// Update the PropertyOfferSchema to make message optional
const PropertyOfferSchema = z
  .object({
    property_id: z.string(),
    proposed_price: z.number().min(0),
    message: z.string().max(1000).optional(),
    expires_at: z.date(),
    check_in_date: z.date(),
    check_out_date: z.date(),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.check_in_date);
      const checkOut = new Date(data.check_out_date);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["check_out_date"],
    }
  );

type PropertyOfferFormData = z.infer<typeof PropertyOfferSchema>;

interface Review {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  date: number;
}

// Add proper types for the error response
interface ErrorResponse {
  response?: {
    data?: {
      errors?: Record<string, string[]>;
      message?: string;
    };
  };
}

// Add interfaces for image and amenity types
interface PropertyImage {
  image_url: string;
}

interface PropertyAmenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export default function PropertyPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [review, setReview] = useState<Review | null>(null);
  const [checkInOpen, setCheckInOpen] = useState<boolean>(false);
  const [checkOutOpen, setCheckOutOpen] = useState<boolean>(false);
  const [offerCheckInOpen, setOfferCheckInOpen] = useState<boolean>(false);
  const [offerCheckOutOpen, setOfferCheckOutOpen] = useState<boolean>(false);
  const [nightsCount, setNightsCount] = useState<number>(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [minimumOffer, setMinimumOffer] = useState<number | null>(null);
  const [isLoadingMinimumOffer, setIsLoadingMinimumOffer] =
    useState<boolean>(false);
  const [pricingDetails, setPricingDetails] = useState<{
    minimum_price: number;
    base_price: number;
    duration_nights: number;
    price_per_night: number;
    discount_percentage: number;
  } | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState<boolean>(false);
  const [showOfferHistory, setShowOfferHistory] = useState<boolean>(false);
  const [hasPendingOffer, setHasPendingOffer] = useState<boolean>(false);
  const [bookingOfferPrice, setBookingOfferPrice] = useState<number | null>(
    null
  );
  const [bookingOfferId, setBookingOfferId] = useState<string | null>(null);
  const [isRedirectingToMessage, setIsRedirectingToMessage] =
    useState<boolean>(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isAcceptingCounterOffer, setIsAcceptingCounterOffer] = useState<string | null>(null);
  const [isMakingNewOffer, setIsMakingNewOffer] = useState<string | null>(null);
  const [acceptedCounterOffer, setAcceptedCounterOffer] = useState<Offer | null>(null);

  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") === "offers" ? "offer" : searchParams?.get("tab") === "message" ? "message" : "book";
  const [tab, setTab] = useState(initialTab);
  const params = useParams();
  const router = useRouter();

  const propertyId = params?.propertyId as string;
  const { user } = useAuthStore((state) => state);
  const { data, isLoading } = useProperty(propertyId, "/properties");
  const createConversation = useCreateConversation();

  // Redirect to hourly rental page if property is hourly
  useEffect(() => {
    if (!isLoading && data?.rental_type?.slug === "hourly") {
      router.replace(`/hourly-rentals/${propertyId}`);
    }
  }, [isLoading, data, propertyId, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<CheckPropertyAvailabilityFormData>({
    resolver: zodResolver(CustomCheckPropertyAvailabilitySchema),
    defaultValues: {
      check_in_date: new Date(),
      check_out_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to next day
      guests_count: 1,
      total_price: 0,
    },
  });

  const checkInDate = watch("check_in_date");
  const checkOutDate = watch("check_out_date");

  // Calculate nights and total price when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && data?.price_per_night) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Only calculate if checkout is after checkin
      if (checkOut > checkIn) {
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setNightsCount(diffDays);
        const calculatedTotal = diffDays * (data?.price_per_night || 0);
        setValue("total_price", calculatedTotal);
      }
    }
  }, [checkInDate, checkOutDate, data?.price_per_night, setValue]);

  const {
    register: registerOffer,
    handleSubmit: handleOfferSubmit,
    setValue: setOfferValue,
    watch: watchOffer,
    formState: { errors: offerErrors, isSubmitting: isSubmittingOffer },
  } = useForm<PropertyOfferFormData>({
    resolver: zodResolver(PropertyOfferSchema),
    defaultValues: {
      property_id: propertyId,
      message: "",
      expires_at: new Date(),
      proposed_price: 0,
      check_in_date: new Date(),
      check_out_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    mode: "onChange",
  });

  const offerCheckInDate = watchOffer("check_in_date");
  const offerCheckOutDate = watchOffer("check_out_date");
  const currentOfferPrice = watchOffer("proposed_price");

  // Fetch minimum offer when user selects a date
  const fetchMinimumOffer = useCallback(
    async (checkIn: Date, checkOut: Date) => {
      if (!checkIn || !checkOut || checkOut <= checkIn) return;

      setIsLoadingMinimumOffer(true);
      try {
        const response = await axiosBase.get(
          `/properties/${propertyId}/minimum-offer`,
          {
            params: {
              check_in: checkIn.toISOString().split("T")[0],
              check_out: checkOut.toISOString().split("T")[0],
            },
          }
        );

        const minimumPrice = response.data.data.minimum_price;
        setMinimumOffer(minimumPrice);
        setPricingDetails(response.data.data);

        // Set initial proposed price to minimum price
        setOfferValue("proposed_price", minimumPrice, { shouldValidate: true });
      } catch (error) {
        console.error("Error fetching minimum offer:", error);
        console.error("Failed to fetch minimum offer. Please try again.");
        setMinimumOffer(null);
        setPricingDetails(null);
      } finally {
        setIsLoadingMinimumOffer(false);
      }
    },
    [propertyId, setOfferValue]
  );

  const formatDate = (date?: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB");
  };

  const goBack = () => {
    router.back();
  };

  // Memoize the reviews data to prevent unnecessary re-renders
  const reviews = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: faker.person.fullName(),
      description:
        "The view from the balcony was amazing! We loved spending our evenings enjoying the scenery. The apartment was also well-equipped and in a fantastic location. Would stay again.",
      image: faker.image.avatar(),
      rating: Math.floor(Math.random() * 5) + 1,
      date: Date.now(),
    }));
  }, []);

  // Memoize the fallback image
  const fallbackImage = useMemo(() => "/images/fallback-property.jpg", []);

  // Memoize the property data
  const propertyData = useMemo(() => data, [data]);

  console.log({ propertyData });

  // Memoize handlers
  const handleBookingRequest = useCallback(async () => {
    try {
      setIsRedirecting(true);
      const formData = getValues();
      // Use bookingOfferPrice if set, otherwise use form value
      const priceToSend = bookingOfferPrice ?? formData.total_price;

      // Helper function to format date
      const formatDate = (date: Date | string | undefined): string => {
        if (!date) return "";
        if (date instanceof Date) {
          return date.toISOString().split("T")[0];
        }
        if (typeof date === "string") {
          return date.split("T")[0];
        }
        return "";
      };

      // Format dates as YYYY-MM-DD
      const checkInDate = formatDate(formData.check_in_date);
      const checkOutDate = formatDate(formData.check_out_date);

      // Always use the formatted dates in the payload
      const payload = {
        ...formData,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: priceToSend,
        has_offer: !!bookingOfferPrice,
        offer_id: bookingOfferId,
      };

      const response = await axiosBase.post(
        `/properties/${propertyId}/bookings`,
        payload
      );

      if (response?.data?.data?.checkout_url) {
        window.location.href = response.data.data.checkout_url;
      } else {
        console.error("Failed to get checkout URL. Please try again.");
        setIsRedirecting(false);
      }
    } catch (error: unknown) {
      setIsRedirecting(false);
      console.error("Error confirming booking:", error);
      if (error && typeof error === "object" && "message" in error) {
        console.error((error as { message: string }).message);
      } else {
        console.error("An error occurred while confirming booking");
      }
    }
  }, [getValues, bookingOfferPrice, bookingOfferId, propertyId]);

  // Optimize the image carousel rendering
  const renderImageCarousel = useMemo(() => {
    if (!propertyData?.images || propertyData.images.length === 0) {
      return (
        <div className="h-[500px] w-full">
          <SafeImage
            src={fallbackImage}
            alt="Property Image"
            width={400}
            height={500}
            className="w-full h-full object-cover rounded-sm"
            priority
          />
        </div>
      );
    }

    return (
      <Carousel className="w-full">
        <CarouselContent className="h-[500px] relative">
          {propertyData.images.map((src: PropertyImage, index: number) => (
            <CarouselItem key={index} className="h-full">
              <div className="w-full h-full">
                <SafeImage
                  src={src.image_url || fallbackImage}
                  alt={`Property Image ${index + 1}`}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover rounded-sm"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {propertyData.images.length > 1 && (
          <>
            <CarouselPrevious className="bg-[#fff] text-blue-500 w-10 h-10 absolute top-[45%] left-4 -translate-y-1/2 z-10 rounded-full border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors" />
            <CarouselNext className="bg-[#fff] text-blue-500 w-10 h-10 absolute top-[45%] right-4 -translate-y-1/2 z-10 rounded-full border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors" />
          </>
        )}
      </Carousel>
    );
  }, [propertyData?.images, fallbackImage]);

  // Fetch offers history
  const fetchOffers = useCallback(async () => {
    if (!user) return;
    setIsLoadingOffers(true);
    try {
      const response = await axiosBase.get(
        `/offers/guest?property_id=${propertyId}`
      );
      const offers = response.data.data || [];
      setOffers(offers);

      // Check if there's any pending offer for this specific property
      const pendingOffer = offers.find(
        (offer: Offer) =>
          offer.status === "pending" && offer.property_id === propertyId
      );
      setHasPendingOffer(!!pendingOffer);
    } catch (error) {
      console.error("Error fetching offers:", error);
      console.error("Failed to load offer history");
    } finally {
      setIsLoadingOffers(false);
    }
  }, [user, propertyId]);

  // Load offers when user is authenticated
  useEffect(() => {
    if (user && propertyId) {
      fetchOffers();
    }
  }, [user, propertyId, fetchOffers]);

  // Add effect to load offers when tab changes to "offer"
  useEffect(() => {
    if (tab === "offer" && user && propertyId) {
      fetchOffers();
      setShowOfferHistory(true);
    }
  }, [tab, user, propertyId, fetchOffers]);

  const handleOfferRequest = async (formData: PropertyOfferFormData) => {
    if (
      !formData.proposed_price ||
      !formData.check_in_date ||
      !formData.check_out_date
    ) {
      console.error("Please fill in all required fields");
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const maxPrice = pricingDetails?.price_per_night
        ? Math.round(pricingDetails.price_per_night * pricingDetails.duration_nights * 1.5)
        : 0;
      const minPrice = pricingDetails?.minimum_price || 0;

      if (formData.proposed_price < minPrice) {
        console.error(
          `Your offer must be at least ₦${minPrice.toLocaleString()}`
        );
        return;
      }

      if (formData.proposed_price > maxPrice) {
        console.error(`Your offer cannot exceed ₦${maxPrice.toLocaleString()}`);
        return;
      }

      // Helper function to format date
      const formatDate = (date: Date | string): string => {
        if (date instanceof Date) {
          return date.toISOString().split("T")[0];
        }
        return date.split("T")[0];
      };

      await axiosBase.post("/offers", {
        property_id: propertyId,
        proposed_price: Number(formData.proposed_price),
        message: formData.message,
        expires_at: expiresAt.toISOString(),
        check_in: formatDate(formData.check_in_date),
        check_out: formatDate(formData.check_out_date),
      });

      // toast.success('Your offer has been submitted successfully!');
      setShowOfferHistory(true);
      fetchOffers();

      // Reset form with minimum price
      setOfferValue("proposed_price", minimumOffer ?? 0);
      setOfferValue("message", "");
    } catch (error: unknown) {
      console.error("Error submitting offer:", error);
      if ((error as ErrorResponse)?.response?.data?.errors) {
        const errors = (error as ErrorResponse).response?.data?.errors;
        Object.values(errors || {}).forEach((errorMessages: string[]) => {
          errorMessages.forEach((message: string) => {
            console.error(message);
          });
        });
      } else {
        console.error(
          (error as ErrorResponse)?.response?.data?.message ||
            "Failed to submit offer. Please try again."
        );
      }
    }
  };

  // Add function to handle booking from accepted offer
  const handleBookFromOffer = (offer: Offer) => {
    if (!offer || offer.status !== "accepted") return;
    const proposedPrice = Number(offer.proposed_price) || 0;
    setValue("check_in_date", new Date(offer.check_in));
    setValue("check_out_date", new Date(offer.check_out));
    setValue("total_price", proposedPrice);
    setBookingOfferPrice(proposedPrice);
    setBookingOfferId(offer.id);
    setTab("book");
    setIsConfirmModalOpen(true);
  };

  // Handle accepting counter offer - proceed directly to booking
  const handleAcceptCounterOffer = async (offer: Offer) => {
    if (!offer.counter_offer) return;
    
    setIsAcceptingCounterOffer(offer.id);
    
    try {
      // Accept the counter offer via API
      const response = await axiosBase.post(`/offers/${offer.id}/accept-counter`);
      
      if (response.data.success) {
        // Set up booking with counter offer price
        const counterOfferPrice = Number(offer.counter_offer) || 0;
        setValue("check_in_date", new Date(offer.check_in));
        setValue("check_out_date", new Date(offer.check_out));
        setValue("total_price", counterOfferPrice);
        setBookingOfferPrice(counterOfferPrice);
        setBookingOfferId(offer.id);
        
        // Refresh offers to update status
        await fetchOffers();
        
        // Set accepted counter offer for display
        setAcceptedCounterOffer(offer);
        
        // Switch to booking tab and open confirmation modal
        setTab("book");
        setIsConfirmModalOpen(true);
        
        console.log("Counter offer accepted successfully! You can now proceed to book.");
      }
    } catch (error) {
      console.error("Error accepting counter offer:", error);
      console.error("Failed to accept counter offer. Please try again.");
    } finally {
      setIsAcceptingCounterOffer(null);
    }
  };

  // Handle making a new offer - switch to offer tab with pre-filled data
  const handleMakeNewOffer = async (offer: Offer) => {
    setIsMakingNewOffer(offer.id);
    
    try {
      // Set the offer form with the original offer details
      setOfferValue("check_in_date", new Date(offer.check_in));
      setOfferValue("check_out_date", new Date(offer.check_out));
      
      // Fetch minimum offer for these dates
      await fetchMinimumOffer(new Date(offer.check_in), new Date(offer.check_out));
      
      // Pre-fill with a slightly higher price than the minimum or counter offer
      const basePrice = Number(offer.counter_offer || offer.proposed_price) || 0;
      const suggestedPrice = minimumOffer ? Math.max(minimumOffer, basePrice + 1000) : basePrice + 1000;
      setOfferValue("proposed_price", suggestedPrice);
      
      // Clear any existing message
      setOfferValue("message", "");
      
      // Switch to offer tab
      setTab("offer");
      
      console.log("You can now submit a new offer with updated terms.");
    } catch (error) {
      console.error("Error preparing new offer:", error);
    } finally {
      setIsMakingNewOffer(null);
    }
  };

  // Offer status badge component
  const OfferStatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      accepted: { color: "bg-green-100 text-green-800", label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      countered: { color: "bg-blue-100 text-blue-800", label: "Countered" },
      used: { color: "bg-gray-200 text-gray-600", label: "Used" },
      booked: { color: "bg-gray-200 text-gray-600", label: "Booked" },
      invalidated: { color: "bg-gray-200 text-gray-600", label: "Invalidated" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Offer history component
  const OfferHistory = () => (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Offer History for this Property
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOfferHistory(!showOfferHistory)}
          className="text-blue-600 hover:text-blue-700"
        >
          {showOfferHistory ? "Hide" : "Show"} History
        </Button>
      </div>

      {showOfferHistory && (
        <div className="space-y-4">
          {isLoadingOffers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : offers.length > 0 ? (
            <div className="space-y-4">
              {offers.map((offer) => (
                <Card
                  key={offer.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <OfferStatusBadge status={offer.status} />
                        <span className="text-sm text-muted-foreground">
                          {new Date(offer.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <span className="font-semibold text-lg text-blue-600">
                        ₦ {Number(offer.proposed_price).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Check-in
                        </p>
                        <p className="font-medium">
                          {new Date(offer.check_in).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Check-out
                        </p>
                        <p className="font-medium">
                          {new Date(offer.check_out).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {offer.message && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          {offer.message}
                        </p>
                      </div>
                    )}

                    {offer.status === "countered" && (
                      <div className="mt-2 p-4 bg-blue-50 rounded-md border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-blue-800">
                            Host has countered your offer
                          </p>
                          <span className="text-lg font-semibold text-blue-600">
                            ₦ {Number(offer.counter_offer || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
                            onClick={() => handleAcceptCounterOffer(offer)}
                            disabled={isAcceptingCounterOffer === offer.id || isMakingNewOffer === offer.id}
                          >
                            {isAcceptingCounterOffer === offer.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Accepting...
                              </div>
                            ) : (
                              "Accept Counter"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleMakeNewOffer(offer)}
                            disabled={isAcceptingCounterOffer === offer.id || isMakingNewOffer === offer.id}
                          >
                            {isMakingNewOffer === offer.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Preparing...
                              </div>
                            ) : (
                              "Make New Offer"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {offer.status === "accepted" && (
                      <div className="mt-2 p-4 bg-green-50 rounded-md border border-green-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-green-800">
                            Your offer has been accepted!
                          </p>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleBookFromOffer(offer)}
                          >
                            Book Now
                          </Button>
                        </div>
                        <p className="text-sm text-green-700">
                          Proceed to booking to secure your stay at this special
                          rate.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <p className="text-muted-foreground">
                No offers have been made for this property yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // In the component, get the watched total price from react-hook-form
  const watchedTotalPrice = watch("total_price");

  const handleMessageHost = async () => {
    // Check if user is logged in
    if (!user) {
      console.error("Please sign in to message the host");
      router.push(`/auth/signin?redirect=/properties/${propertyId}`);
      return;
    }

    if (!propertyData?.host?.id) {
      console.error("Host information not available");
      return;
    }

    try {
      setIsRedirectingToMessage(true);

      // Try new Swagger API first, fallback to legacy API
      let conversationId = null;

      try {
        // Check if conversation already exists using new API
        console.log('Fetching conversations for property:', propertyData.id);
        const swaggerResponse = await axiosBase.get("/conversations", {
          params: {
            property_id: propertyData.id,
            // Don't filter by user_id in params, let the API return all conversations for this property
            // and we'll filter on the client side
          },
        });
        console.log('Full Swagger API response:', swaggerResponse);
        
        // Extract conversations with multiple fallback strategies
        let swaggerConversations = [];
        
        if (swaggerResponse.data) {
          if (Array.isArray(swaggerResponse.data.data)) {
            swaggerConversations = swaggerResponse.data.data;
          } else if (Array.isArray(swaggerResponse.data)) {
            swaggerConversations = swaggerResponse.data;
          } else if (swaggerResponse.data.conversations && Array.isArray(swaggerResponse.data.conversations)) {
            swaggerConversations = swaggerResponse.data.conversations;
          } else {
            console.warn('Unexpected API response structure:', swaggerResponse.data);
            swaggerConversations = [];
          }
        } else {
          console.warn('No data in API response:', swaggerResponse);
          swaggerConversations = [];
        }
        
        console.log('Swagger conversations response:', swaggerConversations);
        console.log('Is swaggerConversations an array?', Array.isArray(swaggerConversations));
        
        // Ensure swaggerConversations is an array before calling find
        if (!Array.isArray(swaggerConversations)) {
          console.error('swaggerConversations is not an array:', typeof swaggerConversations, swaggerConversations);
          throw new Error('Invalid conversations response format');
        }
        
        // Find conversation for this property between current user and host
        const existingConversation = swaggerConversations.find(
          (conv: unknown) => {
            const conversation = conv as Record<string, unknown>;
            if (!conversation || conversation.property_id !== propertyData.id) return false;
            
            // Check if conversation involves current user and the host
            const participantIds = Array.isArray(conversation.participant_ids) ? conversation.participant_ids as string[] : [];
            const isUserInConversation = 
              conversation.guest_id === user.id || 
              conversation.host_id === user.id ||
              participantIds.includes(user.id);
              
            const hostId = propertyData.host?.id;
            const isHostInConversation = hostId ? (
              conversation.guest_id === hostId || 
              conversation.host_id === hostId ||
              participantIds.includes(hostId)
            ) : false;
              
            return isUserInConversation && isHostInConversation;
          }
        );
        
        if (existingConversation) {
          conversationId = existingConversation.id;
        } else {
          // Create new conversation using Swagger API
          const newConversation = await createConversation.mutateAsync({
            property_id: propertyData.id,
            recipient_id: propertyData.host?.id || '',
            content: `Hi! I'm interested in your property "${propertyData.title}". Could you please provide more information?`,
            message_type: 'text',
          });
          conversationId = newConversation.id;
        }
      } catch (swaggerError) {
        console.error("Swagger API error:", swaggerError);
        console.log("Swagger API not available, using legacy API");
        
        // Fallback to legacy API
        try {
          const legacyResponse = await axiosBase.get(
            `/conversations?property_id=${propertyData.id}&user_id=${propertyData.host.id}`
          );
          const legacyConversations = legacyResponse.data.data || [];

          // Only send hello if no conversation exists
          if (legacyConversations.length === 0) {
            await axiosBase.post(`/properties/${propertyData.id}/messages`, {
              receiver_id: propertyData.host.id,
              content: `Hi! I'm interested in your property "${propertyData.title}". Could you please provide more information?`,
            });
          }
        } catch (legacyError) {
          throw legacyError;
        }
      }

      // Small delay to ensure conversation is available in cache
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to message page with appropriate parameters
      if (conversationId) {
        // Use conversation ID for Swagger API
        router.push(`/guest/message?conversation_id=${conversationId}`);
      } else {
        // Use legacy parameters
        router.push(
          `/guest/message?property_id=${propertyData.id}&receiver_id=${propertyData.host?.id}`
        );
      }
    } catch (error) {
      console.error("Error initiating conversation:", error);
      console.error("Failed to start conversation. Please try again.");
      setIsRedirectingToMessage(false);
    }
  };

  // Refactored: open modal on form submit, check availability inside modal
  const handleCheckAvailability = async (
    formData: CheckPropertyAvailabilityFormData
  ) => {
    // Check if user is logged in
    if (!user) {
      console.error("Please sign in to book a property");
      router.push(`/auth/signin?redirect=/properties/${propertyId}`);
      return;
    }
    // Validate dates
    if (!formData.check_in_date || !formData.check_out_date) {
      console.error("Please select check-in and check-out dates");
      return;
    }
    setIsConfirmModalOpen(true);
    setIsCheckingAvailability(true);
    setAvailabilityError(null);
    setIsAvailable(null);
    // We'll check availability in a useEffect when modal opens
  };

  // Effect: when modal opens, check availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (!isConfirmModalOpen) return;
      setIsCheckingAvailability(true);
      setAvailabilityError(null);
      setIsAvailable(null);
      try {
        // Get latest form values
        const formData = getValues();
        const formatDate = (date: Date | string) => {
          if (date instanceof Date) {
            return date.toISOString().split("T")[0];
          }
          return date.split("T")[0];
        };
        const checkIn = formatDate(formData.check_in_date);
        const checkOut = formatDate(formData.check_out_date);
        const response = await axiosBase.get(
          `/properties/${propertyId}/availability`,
          {
            params: {
              check_in: checkIn,
              check_out: checkOut,
              guests: formData.guests_count,
            },
          }
        );
        console.log(response.data.data.is_available);
        if (response.data.data.is_available) {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
          if (
            axios.isAxiosError(response) &&
            response.response?.data?.message
          ) {
            setAvailabilityError(response.response.data.message);
          } else if (response instanceof Error) {
            setAvailabilityError(response.message);
          } else {
            setAvailabilityError(
              "Failed to check availability. Please try again."
            );
          }
        }
      } catch (error: unknown) {
        setIsAvailable(false);
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          setAvailabilityError(error.response.data.message);
        } else if (error instanceof Error) {
          setAvailabilityError(error.message);
        } else {
          setAvailabilityError(
            "Failed to check availability. Please try again."
          );
        }
      } finally {
        setIsCheckingAvailability(false);
      }
    };
    if (isConfirmModalOpen) {
      checkAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmModalOpen]);

  // If redirecting to hourly rental, show loading
  if (!isLoading && data?.rental_type?.slug === "hourly") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Redirecting to hourly rental...</span>
      </div>
    );
  }

  if (!data && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Property not found.
      </div>
    );
  }

  // Navigation header skeleton
  const HeaderSkeleton = () => (
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );

  // Title skeleton
  const TitleSkeleton = () => (
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-10 w-3/4 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
    </div>
  );

  // Image carousel skeleton
  const CarouselSkeleton = () => (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
      <div className="absolute top-1/2 left-10 -translate-y-1/2">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );

  // Property details skeleton
  const DetailsSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
        <div className="mt-2 space-y-4">
          <Skeleton className="h-4 w-60" />
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex mb-6 gap-8">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col w-full gap-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Reviews section skeleton
  const ReviewsSkeleton = () => (
    <section className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 w-full">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-32 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );

  return (
    <div className="p-6 md:p-10 space-y-8 bg-white">
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            className="flex items-center gap-3 text-base font-medium text-primary cursor-pointer hover:text-primary/80 transition-colors"
            onClick={goBack}
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
          <div className="flex gap-6">
            <Button
              variant="ghost"
              className="cursor-pointer !w-[40px] !h-[40px] !p-0 hover:bg-gray-100 flex items-center justify-center"
            >
              <Share2
                size={20}
                strokeWidth={1.5}
                className="!w-5 !h-5 scale-120"
              />
            </Button>
            <Button
              variant="ghost"
              className="cursor-pointer !w-[40px] !h-[40px] !p-0 hover:bg-gray-100 flex items-center justify-center"
            >
              <Heart
                size={20}
                strokeWidth={1.5}
                className="!w-5 !h-5 scale-120"
              />
            </Button>
            <Button
              onClick={handleMessageHost}
              disabled={isRedirectingToMessage}
              className="bg-[#fff] text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
            >
              {isRedirectingToMessage ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  Redirecting...
                </div>
              ) : (
                "Message Host"
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <TitleSkeleton />
      ) : (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {data?.title?.toUpperCase()}
          </h1>
          <p className="font-bold flex items-center gap-2">
            <span className="text-lg">📍</span> {data?.city}, {data?.state}
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          <CarouselSkeleton />
        ) : (
          <div className="w-full">{renderImageCarousel}</div>
        )}

        {isLoading ? (
          <DetailsSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0ea2e2]">
                ₦ {(data?.price_per_night || 0).toLocaleString()} Per Night
              </h2>
              <p className="text-sm text-muted-foreground">
                ⭐ {data?.rating ?? 4.5} ({data?.reviews_count ?? 10} Reviews)
              </p>
              <div className="text-sm text-muted-foreground mt-2 space-y-4">
                <p>
                  🛏 {data?.bedrooms} beds &nbsp;&nbsp;&nbsp; 🛁{" "}
                  {data?.bathrooms} Baths &nbsp;&nbsp;&nbsp; 👥 {data?.guests}{" "}
                  Guests
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(data?.amenities ?? []).map(
                    (amenity: PropertyAmenity | string, index: number) => (
                      <span
                        key={index}
                        className="bg-[#F4F3FE] text-muted-foreground px-2 py-1 rounded-md"
                      >
                        {typeof amenity === "string" ? amenity : amenity.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <Tabs
              value={tab}
              onValueChange={setTab}
              className="w-full border-none shadow-none mt-8"
            >
              <TabsList className="flex w-full mb-6 bg-transparent border-b border-gray-200 p-0 rounded-none shadow-none">
                <TabsTrigger
                  className="flex-1 bg-[white] border-b-2 border-transparent data-[state=active]:bg-[white] data-[state=active]:border-b-[#06a2e2] py-2 px-4 text-black data-[state=active]:text-black rounded-none data-[state=active]:shadow-none"
                  value="book"
                >
                  Book your stay
                </TabsTrigger>
                <TabsTrigger
                  value="offer"
                  className="flex-1 bg-white border-b-2 border-transparent py-2 px-4 text-black rounded-none data-[state=active]:bg-white data-[state=active]:border-b-[#06a2e2] data-[state=active]:shadow-none"
                >
                  Make an offer
                </TabsTrigger>
                <TabsTrigger
                  value="message"
                  className="flex-1 bg-white border-b-2 border-transparent py-2 px-4 text-black rounded-none data-[state=active]:bg-white data-[state=active]:border-b-[#06a2e2] data-[state=active]:shadow-none"
                >
                  Message Host
                </TabsTrigger>
              </TabsList>

              <TabsContent value="book" className="shadow-none border-none">
                {acceptedCounterOffer && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Counter Offer Accepted!</span>
                      <button
                        onClick={() => setAcceptedCounterOffer(null)}
                        className="ml-auto text-green-600 hover:text-green-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-green-700">
                      You have successfully accepted the host's counter offer of ₦{Number(acceptedCounterOffer.counter_offer || 0).toLocaleString()}. 
                      Your booking details have been pre-filled below. Click "Check Availability" to proceed to payment.
                    </p>
                  </div>
                )}
                <Card className="shadow-none border-none">
                  <CardHeader>
                    <CardTitle>Book your stay</CardTitle>
                    <CardDescription>
                      Select your travel dates and number of guests.
                    </CardDescription>
                  </CardHeader>

                  {/* {!user ? (
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="text-center space-y-4">
                        <p className="text-muted-foreground">You need to be logged in to book this property</p>
                        <Button 
                          onClick={() => router.push(`/auth/signin?redirect=/properties/${propertyId}`)}
                          className="bg-[#0ea2e2] text-white hover:bg-[#0d8bc2]"
                        >
                          Sign In to Book
                        </Button>
                      </div>
                    </CardContent>
                  ) : ( */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit(handleCheckAvailability)();
                    }}
                  >
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex gap-6">
                        {/* Check-in Date */}
                        <Popover
                          open={checkInOpen}
                          onOpenChange={setCheckInOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormInput
                              isCalendar={true}
                              type="text"
                              error={errors.check_in_date}
                              readOnly
                              value={formatDate(checkInDate)}
                              placeholder="Check in date"
                              className="text-muted-foreground py-3 rounded-md h-10 px-10 cursor-pointer"
                              onClick={() => setCheckInOpen(true)}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            side="bottom"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={(date) => {
                                if (date) {
                                  const selectedDate = Array.isArray(date)
                                    ? date[0]
                                    : date;
                                  setValue("check_in_date", selectedDate, {
                                    shouldValidate: true,
                                  });
                                  setCheckInOpen(false);

                                  // If checkout date is before the new checkin date, update it
                                  if (checkOutDate <= selectedDate) {
                                    const nextDay = new Date(selectedDate);
                                    nextDay.setDate(selectedDate.getDate() + 1);
                                    setValue("check_out_date", nextDay, {
                                      shouldValidate: true,
                                    });
                                  }
                                }
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        {/* Check-out Date */}
                        <Popover
                          open={checkOutOpen}
                          onOpenChange={setCheckOutOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormInput
                              isCalendar={true}
                              type="text"
                              error={errors.check_out_date}
                              readOnly
                              value={formatDate(checkOutDate)}
                              placeholder="Check out date"
                              className="text-muted-foreground py-3 rounded-md h-10 px-10 cursor-pointer w-full"
                              onClick={() => setCheckOutOpen(true)}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            side="bottom"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={checkOutDate}
                              onSelect={(date) => {
                                if (date) {
                                  const selectedDate = Array.isArray(date)
                                    ? date[0]
                                    : date;
                                  setValue("check_out_date", selectedDate, {
                                    shouldValidate: true,
                                  });
                                  setCheckOutOpen(false);
                                }
                              }}
                              disabled={(date) => date <= checkInDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Guests */}
                      <div className="flex flex-col w-full">
                        <label className="text-sm font-medium mb-1">
                          Number of Guests
                        </label>
                        <FormInput
                          type="number"
                          error={errors.guests_count}
                          className="w-full"
                          placeholder="Number of guests"
                          {...register("guests_count", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      {/* Show booking summary if valid dates are selected */}
                      {nightsCount > 0 && checkOutDate > checkInDate && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <h3 className="font-medium mb-2">Booking Summary</h3>
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              ₦ {(data?.price_per_night || 0).toLocaleString()}{" "}
                              x {nightsCount} nights
                            </span>
                            <span>₦ {watchedTotalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium mt-3 pt-3 border-t">
                            <span>Total</span>
                            <span>₦ {watchedTotalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={formSubmitting}
                        className="mt-4 w-full bg-[#0ea2e2] cursor-pointer"
                      >
                        {formSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Checking...
                          </div>
                        ) : (
                          "Check Availability"
                        )}
                      </Button>
                    </CardContent>
                  </form>
                  {/* )} */}
                </Card>
              </TabsContent>
              <TabsContent value="offer" className="border-none shadow-none">
                <Card className="border-none shadow-none">
                  <CardHeader>
                    <CardTitle>Make an Offer</CardTitle>
                    <CardDescription>
                      Propose a custom rate and add any special message.
                      {minimumOffer && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Minimum offer: ₦ {minimumOffer.toLocaleString()}
                        </p>
                      )}
                    </CardDescription>
                  </CardHeader>

                  {!user ? (
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="text-center space-y-4">
                        <p className="text-muted-foreground">
                          You need to be logged in to make an offer
                        </p>
                        <Button
                          onClick={() =>
                            router.push(
                              `/auth/signin?redirect=/properties/${propertyId}`
                            )
                          }
                          className="bg-[#0ea2e2] text-white hover:bg-[#0d8bc2]"
                        >
                          Sign In to Make an Offer
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleOfferSubmit(handleOfferRequest)(e);
                        }}
                      >
                        <CardContent className="grid gap-4">
                          {hasPendingOffer ? (
                            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
                              <p className="text-sm text-yellow-800">
                                You have a pending offer. Please wait for the
                                host to respond before making another offer.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-6">
                                {/* Check-in Date */}
                                <Popover
                                  open={offerCheckInOpen}
                                  onOpenChange={setOfferCheckInOpen}
                                >
                                  <PopoverTrigger asChild>
                                    <FormInput
                                      isCalendar={true}
                                      type="text"
                                      error={offerErrors.check_in_date}
                                      readOnly
                                      value={formatDate(offerCheckInDate)}
                                      placeholder="Check in date"
                                      className="text-muted-foreground py-3 rounded-md h-10 px-10 cursor-pointer"
                                      onClick={() => setOfferCheckInOpen(true)}
                                      disabled={hasPendingOffer}
                                    />
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    side="bottom"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={offerCheckInDate}
                                      onSelect={(date) => {
                                        if (date) {
                                          const selectedDate = Array.isArray(
                                            date
                                          )
                                            ? date[0]
                                            : date;
                                          setOfferValue(
                                            "check_in_date",
                                            selectedDate,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                          setOfferCheckInOpen(false);

                                          const checkIn = Array.isArray(
                                            offerCheckInDate
                                          )
                                            ? offerCheckInDate[0]
                                            : offerCheckInDate;
                                          if (
                                            checkIn instanceof Date &&
                                            selectedDate instanceof Date &&
                                            selectedDate > checkIn
                                          ) {
                                            fetchMinimumOffer(
                                              checkIn,
                                              selectedDate
                                            );
                                          }
                                        }
                                      }}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>

                                {/* Check-out Date */}
                                <Popover
                                  open={offerCheckOutOpen}
                                  onOpenChange={setOfferCheckOutOpen}
                                >
                                  <PopoverTrigger asChild>
                                    <FormInput
                                      isCalendar={true}
                                      type="text"
                                      error={offerErrors.check_out_date}
                                      readOnly
                                      value={formatDate(offerCheckOutDate)}
                                      placeholder="Check out date"
                                      className="text-muted-foreground py-3 rounded-md h-10 px-10 cursor-pointer w-full"
                                      onClick={() => setOfferCheckOutOpen(true)}
                                      disabled={hasPendingOffer}
                                    />
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    side="bottom"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={offerCheckOutDate}
                                      onSelect={(date) => {
                                        if (date) {
                                          const selectedDate = Array.isArray(
                                            date
                                          )
                                            ? date[0]
                                            : date;
                                          setOfferValue(
                                            "check_out_date",
                                            selectedDate,
                                            {
                                              shouldValidate: true,
                                            }
                                          );
                                          setOfferCheckOutOpen(false);

                                          const checkIn = Array.isArray(
                                            offerCheckInDate
                                          )
                                            ? offerCheckInDate[0]
                                            : offerCheckInDate;
                                          if (
                                            checkIn instanceof Date &&
                                            selectedDate instanceof Date &&
                                            selectedDate > checkIn
                                          ) {
                                            fetchMinimumOffer(
                                              checkIn,
                                              selectedDate
                                            );
                                          }
                                        }
                                      }}
                                      disabled={(date) =>
                                        date <= offerCheckInDate
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div className="flex flex-col w-full">
                                <label className="text-sm font-medium mb-1">
                                  Your Offer Price (₦)
                                </label>
                                <FormInput
                                  type="number"
                                  placeholder={
                                    isLoadingMinimumOffer
                                      ? "Loading minimum offer..."
                                      : minimumOffer
                                      ? `Minimum offer: ₦ ${minimumOffer.toLocaleString()}`
                                      : "Select dates to see minimum offer"
                                  }
                                  error={offerErrors.proposed_price}
                                  max={
                                    pricingDetails?.price_per_night
                                      ? Math.round(
                                          pricingDetails.price_per_night * pricingDetails.duration_nights * 1.5
                                        )
                                      : 0
                                  }
                                  disabled={
                                    isLoadingMinimumOffer ||
                                    !minimumOffer ||
                                    hasPendingOffer
                                  }
                                  {...registerOffer("proposed_price", {
                                    valueAsNumber: true,
                                    min: {
                                      value: minimumOffer ?? 0,
                                      message: `Offer must be at least ₦ ${
                                        minimumOffer?.toLocaleString() ?? "0"
                                      }`,
                                    },
                                    max: {
                                      value: pricingDetails?.price_per_night
                                        ? Math.round(
                                            pricingDetails.price_per_night * pricingDetails.duration_nights * 1.5
                                          )
                                        : 0,
                                      message: `Offer cannot exceed ₦ ${
                                        pricingDetails?.price_per_night
                                          ? Math.round(
                                              pricingDetails.price_per_night * pricingDetails.duration_nights * 1.5
                                            ).toLocaleString()
                                          : "0"
                                      }`,
                                    },
                                  })}
                                />
                                {isLoadingMinimumOffer ? (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Calculating minimum offer...
                                  </p>
                                ) : pricingDetails ? (
                                  <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-md">
                                    <h4 className="font-medium text-sm">
                                      Pricing Breakdown
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Base Price:
                                        </span>
                                        <span>
                                          ₦{" "}
                                          {(
                                            pricingDetails?.price_per_night || 0
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Price per Night:
                                        </span>
                                        <span>
                                          ₦{" "}
                                          {(
                                            pricingDetails?.price_per_night || 0
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Duration:
                                        </span>
                                        <span>
                                          {pricingDetails?.duration_nights || 0}{" "}
                                          nights
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>
                                          {pricingDetails?.discount_percentage ||
                                            0}
                                          % off
                                        </span>
                                      </div>
                                      <div className="flex justify-between font-medium pt-2 border-t">
                                        <span>Minimum Offer:</span>
                                        <span className="text-blue-600">
                                          ₦{" "}
                                          {(
                                            pricingDetails?.minimum_price || 0
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Maximum Offer:</span>
                                        <span className="text-red-600">
                                          ₦{" "}
                                          {Math.round(
                                            (pricingDetails?.price_per_night || 0) * (pricingDetails?.duration_nights || 1) * 1.5
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Daily Offer Price:</span>
                                        <span>
                                          ₦{" "}
                                          {Math.round(
                                            (pricingDetails?.minimum_price ||
                                              0) /
                                              (pricingDetails?.duration_nights ||
                                                1)
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      {/* Current Offer Breakdown */}
                                      {currentOfferPrice && currentOfferPrice > 0 && (
                                        <>
                                          <div className="border-t pt-3 mt-3">
                                            <h5 className="font-medium text-sm text-blue-800 mb-2">
                                              Your Current Offer
                                            </h5>
                                            <div className="flex justify-between font-medium">
                                              <span>Total Offer:</span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-blue-600">
                                                  ₦{Number(currentOfferPrice).toLocaleString()}
                                                </span>
                                                {pricingDetails && (
                                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                                    Number(currentOfferPrice) >= (pricingDetails.minimum_price || 0) &&
                                                    Number(currentOfferPrice) <= (pricingDetails.price_per_night || 0) * (pricingDetails.duration_nights || 1) * 1.5
                                                      ? 'bg-green-100 text-green-800'
                                                      : 'bg-red-100 text-red-800'
                                                  }`}>
                                                    {Number(currentOfferPrice) >= (pricingDetails.minimum_price || 0) &&
                                                     Number(currentOfferPrice) <= (pricingDetails.price_per_night || 0) * (pricingDetails.duration_nights || 1) * 1.5
                                                      ? 'Valid'
                                                      : 'Invalid'}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                              <span>Per Night:</span>
                                              <span>
                                                ₦{Math.round(
                                                  Number(currentOfferPrice) /
                                                  (pricingDetails?.duration_nights || 1)
                                                ).toLocaleString()}
                                              </span>
                                            </div>
                                            {pricingDetails?.price_per_night && pricingDetails?.duration_nights && (
                                              <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Savings:</span>
                                                <span className={
                                                  Number(currentOfferPrice) < (pricingDetails.price_per_night * pricingDetails.duration_nights)
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }>
                                                  {Number(currentOfferPrice) < (pricingDetails.price_per_night * pricingDetails.duration_nights) ? "-" : "+"}₦{Math.abs(
                                                    (pricingDetails.price_per_night * pricingDetails.duration_nights) - Number(currentOfferPrice)
                                                  ).toLocaleString()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Your offer must be between ₦{" "}
                                      {(
                                        pricingDetails?.minimum_price || 0
                                      ).toLocaleString()}{" "}
                                      and ₦{" "}
                                      {Math.round(
                                        (pricingDetails?.price_per_night || 0) * (pricingDetails?.duration_nights || 1) * 1.5
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Please select check-in and check-out dates
                                    to see pricing details
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col w-full">
                                <label className="text-sm font-medium mb-1">
                                  Message (Optional)
                                </label>
                                <FormInput
                                  type="textarea"
                                  placeholder="Add a message or special request (optional)..."
                                  error={offerErrors.message}
                                  disabled={hasPendingOffer}
                                  {...registerOffer("message")}
                                />
                              </div>

                              <Button
                                type="submit"
                                disabled={
                                  isSubmittingOffer ||
                                  isLoadingMinimumOffer ||
                                  !minimumOffer ||
                                  hasPendingOffer
                                }
                                className="mt-4 w-full bg-[#0ea2e2] text-white hover:bg-[#0d8bc2]"
                              >
                                {isSubmittingOffer ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                  </div>
                                ) : (
                                  "Submit Offer"
                                )}
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </form>
                      <OfferHistory />
                    </>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="message" className="border-none shadow-none">
                <Card className="border-none shadow-none">
                  <CardHeader>
                    <CardTitle>Contact the Host</CardTitle>
                    <CardDescription>
                      Have questions about this property? Start a conversation with the host.
                    </CardDescription>
                  </CardHeader>
                  
                  {!user ? (
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Sign in to message the host</h3>
                        <p className="text-muted-foreground">
                          You need to be logged in to start a conversation with the property host.
                        </p>
                        <Button
                          onClick={() =>
                            router.push(
                              `/auth/signin?redirect=/properties/${propertyId}?tab=message`
                            )
                          }
                          className="bg-[#0ea2e2] text-white hover:bg-[#0d8bc2]"
                        >
                          Sign In to Message Host
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {propertyData?.host?.name || "Property Host"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Host of &ldquo;{propertyData?.title}&rdquo;
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <h5 className="font-medium text-blue-900 mb-2">What you can ask about:</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Property amenities and features</li>
                            <li>• Local area and attractions</li>
                            <li>• Check-in/check-out procedures</li>
                            <li>• Special requests or accommodations</li>
                            <li>• Pricing and availability questions</li>
                          </ul>
                        </div>
                        
                        <Button
                          onClick={handleMessageHost}
                          disabled={isRedirectingToMessage}
                          className="w-full bg-[#0ea2e2] text-white hover:bg-[#0d8bc2] py-3"
                          size="lg"
                        >
                          {isRedirectingToMessage ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Starting conversation...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Start Conversation with Host
                            </div>
                          )}
                        </Button>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-500">
                            Your message will be sent directly to the host. Response times may vary.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {isLoading ? (
        <ReviewsSkeleton />
      ) : (
        <section className="w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 w-full">
            <h2 className="text-2xl font-semibold text-primary">
              What guests are saying
            </h2>
            <div className="flex items-center gap-2 border rounded-md py-3 px-3">
              <span className="text-sm text-muted-foreground">Most recent</span>
              <div className="text-xs px-2 py-1">▼</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review: Review, index: number) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition"
                onClick={() => {
                  setReview(review);
                  setIsModalOpen(true);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={review?.image || "/images/fallback-avatar.jpg"}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <div className="flex gap-1 text-yellow-500">
                        {"⭐".repeat(review.rating)}
                      </div>
                    </div>
                    <p className="ml-auto text-xs text-muted-foreground">
                      2 months ago
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.description.substring(0, 100)}...
                    <span className="text-blue-500 font-semibold">
                      Read more...
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

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

      {/* Booking confirmation modal */}
      <Dialog
        open={isConfirmModalOpen}
        onOpenChange={(open) => {
          setIsConfirmModalOpen(open);
          if (!open) {
            setBookingOfferPrice(null);
            setBookingOfferId(null);
            setIsRedirecting(false);
            setIsCheckingAvailability(false);
            setAvailabilityError(null);
            setIsAvailable(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-lg border-0 shadow-lg bg-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-blue-500">
              Check Availability
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {isCheckingAvailability
                ? "We're checking if your selected dates are available for booking."
                : availabilityError
                ? availabilityError
                : isAvailable
                ? "Your selected dates are available. Proceed to payment to secure your booking."
                : " "}
            </DialogDescription>
          </DialogHeader>

          {isCheckingAvailability ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Checking availability...</p>
            </div>
          ) : availabilityError ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="text-red-600 mb-4">{availabilityError}</div>
              <Button
                type="button"
                variant="outline"
                className="border-blue-500 hover:bg-blue-50 bg-white text-blue-600"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : isAvailable ? (
            <>
              <div className="py-4 border-t border-b border-gray-100">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Check-in:</span>
                    <span className="font-medium">
                      {formatDate(watch("check_in_date"))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Check-out:</span>
                    <span className="font-medium">
                      {formatDate(watch("check_out_date"))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Guests:</span>
                    <span className="font-medium">{watch("guests_count")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Nights:</span>
                    <span className="font-medium">{nightsCount}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-4 border-t text-blue-500">
                    <span>Total:</span>
                    <span>
                      ₦{" "}
                      {(
                        bookingOfferPrice ?? watchedTotalPrice
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium">Property is available!</span>
                </div>
                <p className="text-sm text-green-600">
                  Your selected dates are available. Proceed to payment to
                  secure your booking.
                </p>
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-500 hover:bg-blue-50 bg-white text-blue-600"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-blue-500 text-white hover:bg-blue-700 transition-colors"
                  onClick={handleBookingRequest}
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
