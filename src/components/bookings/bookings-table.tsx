import { axiosBase } from "@woothomes/lib/axiosBase";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@woothomes/lib/utils";
import { Button } from "@woothomes/components/ui/button";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  is_hourly_rental: boolean;
}

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  duration_nights: number;
  guests: number;
  host_id: string;
  is_hourly: boolean;
  offer: string | null;
  payment_status: "pending" | "paid" | "failed";
  property: Property;
  property_id: string;
  special_requests: string | null;
  status: "confirmed" | "cancelled" | "pending";
  total_price: string;
  user_id: string;
}

interface BookingsMeta {
  current_page: number;
  from: number;
  has_more_pages: boolean;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface BookingsResponse {
  bookings: Booking[];
  meta: BookingsMeta;
}

interface BookingTableProps {
  onViewReceipt: (index: number) => void;
}

export default function BookingTable({ onViewReceipt }: BookingTableProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useQuery<BookingsResponse, Error>({
    queryKey: ["bookings", page],
    queryFn: async () => {
      try {
        const res = await axiosBase.get(`/bookings?page=${page}`);
        if (!res?.data?.data?.bookings) {
          throw new Error("Invalid response format");
        }
        return res.data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch bookings";
        throw new Error(errorMessage);
      }
    },
    // keepPreviousData: true,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const bookings = data?.bookings || [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    if (newPage !== page) {
      setPage(newPage);
      const tableSection = document.querySelector(".booking-table-section");
      if (tableSection) {
        tableSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const renderStatusBadge = (status: Booking["status"], paymentStatus: Booking["payment_status"]) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-600";

    if (status === "confirmed" && paymentStatus === "paid") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    } else if (status === "cancelled") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
    } else if (paymentStatus === "pending") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
    }

    return (
      <span className={`${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
        {status} - {paymentStatus}
      </span>
    );
  };

  return (
    <section className="booking-table-section">
      <div className="bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-4">Booking History</h2>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-12">
              Error fetching bookings: {error?.message || "Unknown error"}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No bookings found
            </div>
          ) : (
            <>
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left text-sm font-semibold">
                  <tr>
                    <th className="px-6 py-4">S/N</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: Booking, index: number) => {
                    const propertyTitle = booking?.property?.title || "Unknown Property";
                    const checkIn = booking?.check_in ? formatDate(booking.check_in) : "N/A";
                    const checkOut = booking?.check_out ? formatDate(booking.check_out) : "N/A";
                    const totalPrice = booking?.total_price || "0.00";

                    return (
                      <tr key={booking.id || index} className="border-b text-sm hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">
                          {(meta?.from || 0) + index}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(booking.status, booking.payment_status)}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {propertyTitle}
                        </td>
                        <td className="px-6 py-4">{checkIn}</td>
                        <td className="px-6 py-4">{checkOut}</td>
                        <td className="px-6 py-4 font-semibold">
                          ₦ {totalPrice}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => onViewReceipt(index)}
                            className="bg-[#f4f2fd] text-[#9aa2cc] px-4 py-2 rounded-md hover:bg-[#e9e6f8] transition-colors"
                            disabled={booking.payment_status !== "paid"}
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    disabled={page === 1 || isFetching}
                    onClick={() => handlePageChange(page - 1)}
                    variant="outline"
                  >
                    Previous
                  </Button>

                  {meta.last_page <= 7 ? (
                    [...Array(meta.last_page)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className={pageNum === page ? "font-bold" : ""}
                          disabled={isFetching}
                        >
                          {pageNum}
                        </Button>
                      );
                    })
                  ) : (
                    <>
                      {[1, 2, page - 1, page, page + 1, meta.last_page - 1, meta.last_page]
                        .filter(p => p > 0 && p <= meta.last_page)
                        .filter((p, i, arr) => arr.indexOf(p) === i)
                        .sort((a, b) => a - b)
                        .map((pageNum, i, arr) => {
                          if (i > 0 && pageNum - arr[i - 1] > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${pageNum}`}>
                                <span className="px-2">...</span>
                                <Button
                                  key={pageNum}
                                  variant={pageNum === page ? "default" : "outline"}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={pageNum === page ? "font-bold" : ""}
                                  disabled={isFetching}
                                >
                                  {pageNum}
                                </Button>
                              </React.Fragment>
                            );
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === page ? "default" : "outline"}
                              onClick={() => handlePageChange(pageNum)}
                              className={pageNum === page ? "font-bold" : ""}
                              disabled={isFetching}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                    </>
                  )}

                  <Button
                    disabled={page === meta.last_page || isFetching}
                    onClick={() => handlePageChange(page + 1)}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}

              {isFetching && (
                <div className="text-sm text-center text-gray-500 mt-2">
                  Updating bookings...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
