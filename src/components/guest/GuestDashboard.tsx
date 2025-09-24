"use client";

import { Calendar, Clock, Heart, List } from "lucide-react";
import { useAuthStore } from "@woothomes/store";
import { MetricCard } from "../host/MetricCard";
import { useEffect, useState } from "react";
import { axiosBase } from "../../lib/axiosBase";
import Image from "next/image";

interface User {
  name: string;
  // Add other user properties as needed
}

interface Booking {
  id: string;
  property: {
    title: string;
    images: {
      image_url: string;
    }[];
  };
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
}

interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface BookingResponse {
  data: Booking[];
  meta: Pagination;
}

export const GuestDashboard = () => {
  const { user } = useAuthStore((state: { user: User | null }) => state);
  const [metrics, setMetrics] = useState({
    upcoming_bookings: 0,
    active_bookings: 0,
    total_bookings: 0,
    wishlist_count: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosBase.get<BookingResponse>(`/dashboard/bookings?page=${page}`);
      setBookings(response.data.data || []);
      setPagination(response.data.meta || {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const metricsRes = await axiosBase.get('/dashboard/overview');

        setMetrics(metricsRes.data.data || {
          upcoming_bookings: 0,
          active_bookings: 0,
          total_bookings: 0,
          wishlist_count: 0
        });
        fetchBookings();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchBookings(page);
    }
  };

  return (
    <div className="bg-[#EEEEEE] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">Manage your bookings</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <MetricCard
            icon={<Calendar size={24} />}
            label="Active Bookings"
            value={metrics.active_bookings ?? 0}
          />
          <MetricCard
            icon={<Clock size={24} />}
            label="Upcoming Bookings"
            value={metrics.upcoming_bookings ?? 0}
          />
          <MetricCard
            icon={<List size={24} />}
            label="Total Bookings"
            value={metrics.total_bookings ?? 0}
          />
          <MetricCard
            icon={<Heart size={24} />}
            label="Wishlist Items"
            value={metrics.wishlist_count ?? 0}
          />
        </div>

        {/* Booking History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Booking History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : !bookings || bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <Image
                              className="rounded-full object-cover"
                              src={booking.property.images[0].image_url}
                              alt={booking.property.title}
                              fill
                              sizes="40px"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.property.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.check_in).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.check_out).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          booking.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        NGN {Number(booking.total_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} bookings
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      pagination.current_page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      pagination.current_page === pagination.last_page
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
