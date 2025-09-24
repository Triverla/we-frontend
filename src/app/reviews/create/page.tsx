"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";
import { useAuthStore } from "@woothomes/store";
import { ReviewFormModal } from "@woothomes/components/properties/ReviewFormModal";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@woothomes/components/ui/button";

interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    primary_image?: {
      image_url: string;
    };
  };
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
}

function CreateReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, hydrated } = useAuthStore((state) => state);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const bookingId = searchParams.get('booking_id');

  // Check authentication
  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      console.error("Please login to leave a review");
      router.replace(`/auth/signin?redirect=${encodeURIComponent(window.location.href)}`);
      return;
    }

    setAuthChecked(true);
  }, [user, hydrated, router]);

  // Fetch booking details
  useEffect(() => {
    if (!authChecked || !bookingId) return;

    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const response = await axiosBase.get(`/bookings/${bookingId}`);
        const bookingData = response.data.data;
        
        // Verify the booking belongs to the authenticated user
        if (bookingData.user_id !== user?.id) {
          console.error("You can only review your own bookings");
          router.push("/properties/booking");
          return;
        }
        
        setBooking(bookingData);
      } catch (error: unknown) {
        console.error("Error fetching booking:", error);
        console.error("Failed to load booking details. Please check your email link.");
        router.push("/properties/booking");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, authChecked, router, user?.id]);

  const handleReviewSuccess = () => {
    // toast.success("Thank you for your review!");
    router.push("/properties/booking");
  };

  const handleBackToBookings = () => {
    router.push("/properties/booking");
  };

  // Show loading when checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading when fetching booking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error if no booking found
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find the booking you&apos;re looking for. Please check your email link or contact support.
          </p>
          <Button onClick={handleBackToBookings} className="bg-blue-600 hover:bg-blue-700">
            Back to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToBookings}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Bookings
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Leave a Review</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Info */}
            <div className="flex gap-4">
              {booking.property.primary_image && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={booking.property.primary_image.image_url}
                    alt={booking.property.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{booking.property.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {booking.property.address}, {booking.property.city}
                </p>
                <div className="text-sm text-gray-500">
                  <p>Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
                  <p>Guests: {booking.guests}</p>
                </div>
              </div>
            </div>

            {/* Booking Status */}
            <div className="flex flex-col justify-center">
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{booking.total_price.toLocaleString()}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review CTA */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How was your stay?
            </h2>
            <p className="text-gray-600 mb-6">
              Share your experience with {booking.property.title} to help other travelers make informed decisions.
            </p>
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            >
              Write a Review
            </Button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {booking && (
        <ReviewFormModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          propertyId={booking.property_id}
          bookingId={booking.id}
          propertyTitle={booking.property.title}
          onSuccess={handleReviewSuccess}
          reviewType="guest"
        />
      )}
    </div>
  );
}

// Loading fallback component
function CreateReviewLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function CreateReviewPage() {
  return (
    <Suspense fallback={<CreateReviewLoading />}>
      <CreateReviewContent />
    </Suspense>
  );
} 