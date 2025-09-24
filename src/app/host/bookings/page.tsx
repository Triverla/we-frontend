"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  Button,
  Calendar,
  LoadingSpinner,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Dialog,
  DialogContent,
  DialogClose,
} from "@woothomes/components";
import { axiosBase } from "@woothomes/lib";
import { SafeImage } from "@woothomes/components/ui/SafeImage";

// Define types for booking and meta
interface Booking {
  id: string;
  user: { name: string; email: string };
  property: { title: string; address: string; city: string; images?: { image_url: string }[] };
  check_in?: string;
  check_out?: string;
  total_price: number | string;
  status: string;
  guests: number;
  payment_status: string;
  special_requests?: string | null;
}

interface Meta {
  total: number;
}

// Fetch bookings from /host/bookings endpoint using axiosBase
async function fetchHostBookings({
  page = 1,
  per_page = 12,
  status,
  type,
  start_date,
  end_date,
  property,
}: {
  page?: number;
  per_page?: number;
  status?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  property?: string;
} = {}) {
  const params: Record<string, string | number> = { page, per_page };
  if (status && status !== "all") params.status = status;
  if (type && type !== "guest") params.type = type;
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  if (property && property !== "all") params.property = property;
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await axiosBase.get(`/host/bookings?${query}`);
  return res.data;
}

const BookingLogsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"host" | "guest">("guest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 12;

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    propertyFilter,
    typeFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchHostBookings({
      page: currentPage,
      per_page: itemsPerPage,
      status: statusFilter,
      type: typeFilter,
      start_date: startDate,
      end_date: endDate,
      property: propertyFilter,
    })
      .then((data) => {
        setBookings(data.data.bookings || []);
        setMeta(data.meta || null);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [currentPage, statusFilter, typeFilter, startDate, endDate, propertyFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartDateSelect = (date: string) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setStartDate(formattedDate);
    } else {
      setStartDate("");
    }
  };

  const handleEndDateSelect = (date: string) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setEndDate(formattedDate);
    } else {
      setEndDate("");
    }
  };

  const totalPages = meta?.total ? Math.ceil(meta.total / itemsPerPage) : 1;

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Booking & Transaction Logs
        </h1>
        <p className="text-gray-600">
          View and manage the booking log of properties
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients, properties, locations"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <button className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property
                </label>
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Properties</option>
                  <option value="All properties">All Properties</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={typeFilter}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="host">Host</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        startDate ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(new Date(startDate), "MMM dd, yyyy")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate ? new Date(startDate) : new Date()}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onSelect={(date: any) => handleStartDateSelect(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        endDate ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(new Date(endDate), "MMM dd, yyyy")
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate ? new Date(endDate) : undefined}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onSelect={(date: any) => handleEndDateSelect(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
          Showing page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8 px-4">
              <p className="text-lg font-medium">Error loading bookings</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings && bookings?.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {booking.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {booking.property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.property.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.check_in
                          ? format(new Date(booking.check_in), "MMM dd, yyyy")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.check_out
                          ? format(new Date(booking.check_out), "MMM dd, yyyy")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{Number(booking.total_price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-lg font-medium">No bookings found</div>
                        <div className="text-sm mt-1">Try adjusting your filters or search terms</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl shadow-xl print:block">
          {selectedBooking && (
            <div className="bg-white print:bg-white">
              {/* Header with property image and title */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 border-b print:border-none">
                <SafeImage
                  src={selectedBooking.property.images?.[0]?.image_url || '/placeholder.jpg'}
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
                    <div className="text-base text-gray-800 font-medium">{selectedBooking.user.name}</div>
                    <div className="text-sm text-gray-500">{selectedBooking.user.email}</div>
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
                    <div className="text-base text-gray-800">{format(new Date(selectedBooking.check_in!), "MMM dd, yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Check-out</div>
                    <div className="text-base text-gray-800">{format(new Date(selectedBooking.check_out!), "MMM dd, yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Price</div>
                    <div className="text-lg font-bold text-blue-700">₦{Number(selectedBooking.total_price).toLocaleString()}</div>
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
                  <DialogClose asChild>
                    <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                      Close
                    </button>
                  </DialogClose>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* End Booking Details Modal */}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, meta?.total || 0)}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * itemsPerPage, meta?.total || 0)}</span> of{' '}
          <span className="font-medium">{meta?.total || 0}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md ${
                    currentPage === pageNum
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BookingLogsPage;
