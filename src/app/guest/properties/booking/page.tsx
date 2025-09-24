/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useNavigation } from "@woothomes/hooks/useNavigation";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { axiosBase } from "@woothomes/lib";
import { SafeImage } from "@woothomes/components/ui/SafeImage";

// Add Google Fonts (Montserrat)
if (typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  is_hourly_rental: boolean;
  primary_image: string;
  images: string[];
}

interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  host_id: string;
  guests: number;
  total_price: string;
  status: string;
  payment_status: string;
  special_requests: string | null;
  is_hourly: boolean;
  check_in: string;
  check_out: string;
  duration_nights: number;
  property: Property;
  offer: any | null;
}

interface MetaData {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  has_more_pages: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    meta: MetaData;
  };
}

type NormalizedImage = { id: string; image_url: string; is_primary: boolean };

export default function BookingPage() {
  const { goToRoute } = useNavigation();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axiosBase.get<ApiResponse>(`/bookings?page=${page}`);
      const { data } = response.data;
      if (data?.bookings && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
        setMeta(data.meta);
      } else {
        setBookings([]);
        setMeta(null);
      }
    } catch {
      setBookings([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleCancel = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const handleProceed = (bookingId: string) => {
    goToRoute(`/guest/properties/payment?bookingId=${bookingId}`);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Modal image logic
  let modalImage = '/placeholder.jpg';
  if (selectedBooking && selectedBooking.property.images && Array.isArray(selectedBooking.property.images)) {
    const modalImages: (string | { image_url: string })[] = selectedBooking.property.images;
    if (modalImages.length > 0) {
      const img0 = modalImages[0];
      if (typeof img0 === 'string') {
        modalImage = img0;
      } else if (img0 && typeof img0 === 'object' && 'image_url' in img0 && typeof img0.image_url === 'string') {
        modalImage = img0.image_url;
      }
    }
  }

  // Modern card grid for bookings
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen py-8 px-2 font-[Montserrat]">
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <button
          className="mb-6 flex items-center gap-2 text-base font-medium text-blue-600 hover:text-blue-800 transition-colors bg-white rounded-full px-4 py-2 shadow-sm border border-blue-100 w-fit"
          onClick={() => router.back()}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Go Back
        </button>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Your Bookings</h1>
        <p className="text-gray-500 text-lg">
          {meta?.total ? `Showing ${meta.from}-${meta.to} of ${meta.total} bookings` : 'All your bookings in one place.'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <span className="text-blue-600 text-lg font-medium">Loading your bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <SafeImage src="/empty-state.svg" alt="No bookings" width={160} height={160} className="w-40 h-40 mb-4 opacity-80" />
            <span className="text-gray-500 text-lg mb-4">You have no bookings yet.</span>
            <button
              onClick={() => goToRoute('/guest/properties')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking, idx) => {
              const images: NormalizedImage[] = Array.isArray(booking.property.images)
                ? (booking.property.images as (string | { image_url: string })[]).map((img, i) => {
                    if (typeof img === 'string') {
                      return { id: String(i), image_url: img, is_primary: i === 0 };
                    } else if (img && typeof img === 'object' && 'image_url' in img && typeof img.image_url === 'string') {
                      return { id: String(i), image_url: img.image_url, is_primary: i === 0 };
                    } else {
                      return { id: String(i), image_url: '/placeholder.jpg', is_primary: i === 0 };
                    }
                  })
                : [{ id: '0', image_url: '/placeholder.jpg', is_primary: true }];
              const primaryImage = images[0].image_url;
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow border border-blue-100 flex flex-col overflow-hidden group transform-gpu hover:scale-[1.025] duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <SafeImage
                      src={primaryImage}
                      alt={booking.property.title}
                      width={800}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.payment_status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-6 gap-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-1 truncate">{booking.property.title}</h2>
                    <div className="text-gray-500 text-sm mb-2 truncate">{booking.property.address}, {booking.property.city}</div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-2">
                      <span><strong>Guests:</strong> {booking.guests}</span>
                      <span><strong>Duration:</strong> {booking.duration_nights} night{booking.duration_nights !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-2">
                      <span><strong>Check-in:</strong> {new Date(booking.check_in).toLocaleDateString()}</span>
                      <span><strong>Check-out:</strong> {new Date(booking.check_out).toLocaleDateString()}</span>
                    </div>
                    {booking.special_requests && (
                      <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mb-2 w-fit"><strong>Special:</strong> {booking.special_requests}</div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t">
                      <span className="text-lg font-bold text-blue-700">₦{parseFloat(booking.total_price).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProceed(booking.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
                        >
                          Pay Now
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:bg-white print:relative print:z-0">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-fade-in-up print:shadow-none print:max-w-full print:rounded-none">
            {/* Modal Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 border-b print:border-none">
              <SafeImage
                src={modalImage}
                alt={selectedBooking.property.title}
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-xl border shadow-md print:hidden"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedBooking.property.title}
                </h2>
                <div className="text-gray-500 text-sm">
                  {selectedBooking.property.address}, {selectedBooking.property.city}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {selectedBooking.payment_status.charAt(0).toUpperCase() + selectedBooking.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Guest</div>
                  <div className="text-base text-gray-800 font-medium">{selectedBooking.user_id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Guests</div>
                  <div className="text-base text-gray-800">{selectedBooking.guests}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Special Requests</div>
                  <div className="text-base text-gray-800">{selectedBooking.special_requests || '—'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Check-in</div>
                  <div className="text-base text-gray-800">{new Date(selectedBooking.check_in).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Check-out</div>
                  <div className="text-base text-gray-800">{new Date(selectedBooking.check_out).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Price</div>
                  <div className="text-lg font-bold text-blue-700">₦{parseFloat(selectedBooking.total_price).toLocaleString()}</div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex justify-between items-center gap-4 px-6 py-4 border-t print:hidden">
              <span className="text-xs text-gray-400">Booking ID: {selectedBooking.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End Booking Details Modal */}

      {/* Animations */}
      <style jsx global>{`
        .font-[Montserrat] { font-family: 'Montserrat', sans-serif; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.7s both; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        .animate-fade-in-up { animation: fade-in-up 0.5s both; }
      `}</style>
    </div>
  );
}
