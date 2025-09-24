"use client";

import React, { useState } from "react";
import { Button } from "@woothomes/components/ui/button";
import { CancelModal } from "./CancelModal";
import { formatDate } from "../../lib/utils";
// import { toast } from "sonner";
import { axiosBase } from "@woothomes/lib";
import { Skeleton } from "@woothomes/components/ui/skeleton";
import { SafeImage } from "@woothomes/components/ui/SafeImage";

interface Booking {
  bookingId: string;
  title: string;
  location: string;
  payment_status: string;
  status: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  total: string;
  duration_nights: number;
  special_requests: string | null;
  is_hourly: boolean;
  primaryImage?: { id: string; image_url: string; is_primary: boolean };
  images?: { id: string; image_url: string; is_primary: boolean }[];
  host_id?: string;
  property_id?: string;
  property?: {
    images?: { id: string; image_url: string; is_primary: boolean }[];
  };
}

interface BookingCardListProps {
  bookings: Booking[];
  onCancel: (bookingId: string) => void;
  onProceed?: (bookingId: string) => void;
  onReview?: (bookingId: string, propertyId: string) => void;
  onMessageHost?: (hostId: string, propertyId: string) => void;
  isLoading?: boolean;
}

const StatusBadge = ({ status, paymentStatus }: { status: string; paymentStatus: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex gap-2">
      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(status)}`}>
        {status === 'cancelled' ? '❌ Cancelled' : status === 'confirmed' ? '✅ Confirmed' : status === 'completed' ? '🏅 Completed' : '⏳ Pending'}
      </span>
      {paymentStatus === 'pending' && (
        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
          💰 Payment Pending
        </span>
      )}
    </div>
  );
};

const BookingCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md flex flex-col pb-8 border border-gray-100">
    <div className="px-6 pt-4 flex-1 flex flex-col">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export function BookingCardList({ bookings = [], onCancel, onProceed, onReview, onMessageHost, isLoading = false }: BookingCardListProps) {
  // Track which booking is being cancelled
  const [cancelModalOpenId, setCancelModalOpenId] = useState<string | null>(null);
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);

  const handleCancel = async (bookingId: string, reason: string) => {
    setIsCancellingId(bookingId);
    try {
      await axiosBase.put(`/bookings/${bookingId}/cancel`, { reason });
      // toast.success("Booking cancelled successfully.");
      setCancelModalOpenId(null);
      onCancel(bookingId);
    } catch (error: unknown) {
      const errorMessage =
        (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && (error.response.data as { message?: string }).message) ||
        (error as Error)?.message ||
        "Failed to cancel booking. Please try again.";
      console.error(String(errorMessage));
      console.error("Error details:", error);
    } finally {
      setIsCancellingId(null);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <BookingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!isLoading && (!bookings || bookings.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
        <p className="text-gray-500">You haven&apos;t made any bookings yet.</p>
      </div>
    );
  }

  // Show bookings
  return (
    <div className="flex flex-col gap-6">
      {bookings.map((booking) => {
        const imageUrl = booking.property?.images?.[0]?.image_url || "/images/fallback-property.jpg";
        return (
          <div
            key={booking.bookingId}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col md:flex-row border border-gray-100 group w-full overflow-hidden"
          >
            {/* Property Image */}
            <div className="md:w-48 w-full h-40 md:h-40 flex-shrink-0 relative">
              <SafeImage
                src={imageUrl}
                alt={booking.title}
                width={192}
                height={160}
                className="w-full h-full object-cover"
                priority={false}
              />
            </div>
            {/* Card Content */}
            <div className="flex-1 flex flex-col justify-between px-6 py-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                  <h2 className="text-lg font-bold text-[#0ea2e2] truncate">{booking.title}</h2>
                  <StatusBadge status={booking.status} paymentStatus={booking.payment_status} />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-2 truncate">📍 {booking.location}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                  <div className="flex justify-between"><span className="text-gray-500">Guests</span><span>{booking.guests}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{booking.duration_nights} {booking.duration_nights === 1 ? 'night' : 'nights'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Check In</span><span className="underline cursor-pointer">{formatDate(booking.checkIn)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Check Out</span><span>{formatDate(booking.checkOut)}</span></div>
                  <div className="flex justify-between font-semibold col-span-2 border-t pt-2 mt-2"><span>Total</span><span className="text-lg text-blue-600 font-bold">{booking.total}</span></div>
                </div>
                {booking.special_requests && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Special Requests:</span> {booking.special_requests.replace(/'/g, "&apos;")}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <Button
                    isLoading={isCancellingId === booking.bookingId}
                    onClick={() => setCancelModalOpenId(booking.bookingId)}
                    variant="primary"
                    className="w-full sm:w-auto text-[#fff] cursor-pointer font-medium py-3 px-4 rounded hover:text-black hover:bg-gray-50"
                  >
                    Cancel Booking
                  </Button>
                )}
                {onProceed && booking.status === 'pending' && booking.payment_status === 'pending' && (
                  <Button
                    onClick={() => onProceed(booking.bookingId)}
                    variant="secondary"
                    className="w-full sm:w-auto font-medium py-3 px-4 rounded"
                  >
                    Proceed to Payment
                  </Button>
                )}
                {onReview && booking.status === 'confirmed' && new Date(booking.checkOut) < new Date() && booking.property_id && (
                  <Button
                    onClick={() => onReview(booking.bookingId, booking.property_id as string)}
                    variant="outline"
                    className="w-full sm:w-auto font-medium py-3 px-4 rounded border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    Review Property
                  </Button>
                )}
                {onMessageHost && booking.host_id && booking.property_id && (
                  <Button
                    onClick={() => onMessageHost(booking.host_id as string, booking.property_id as string)}
                    variant="outline"
                    className="w-full sm:w-auto font-medium py-3 px-4 rounded border-green-500 text-green-500 hover:bg-green-50"
                  >
                    Message Host
                  </Button>
                )}
              </div>
            </div>
            <CancelModal
              open={cancelModalOpenId === booking.bookingId}
              onClose={() => setCancelModalOpenId(null)}
              onConfirm={(reason) => handleCancel(booking.bookingId, reason)}
              isLoading={isCancellingId === booking.bookingId}
            />
          </div>
        );
      })}
    </div>
  );
}
