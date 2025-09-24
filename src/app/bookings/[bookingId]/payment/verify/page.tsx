"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Button } from "@woothomes/components/ui/button";
import { axiosBase } from "@woothomes/lib";
import { CheckCircle, XCircle } from "lucide-react";

interface PaymentDetails {
  amount: number;
  currency: string;
  paid_at: string;
  reference: string;
  payment_channel: string;
  payment_gateway_response: string;
}

interface BookingDetails {
  id: string;
  property_id: string;
  guests: number;
  total_price: string;
  status: string;
  payment_status: string;
  check_in: string;
  check_out: string;
  property?: {
    title: string;
    address: string;
    city: string;
  };
}

export default function PaymentVerifyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  const bookingId = params.bookingId as string;
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    const verifyAll = async () => {
      if (!reference || !bookingId) {
        setError("Missing payment reference or booking ID.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const paymentRes = await axiosBase.get(`/payments/verify?reference=${reference}`);
        if (!paymentRes.data?.success) throw new Error(paymentRes.data?.message || "Payment verification failed.");
        setPayment(paymentRes.data.data.payment);

        const bookingRes = await axiosBase.get(`/bookings/${bookingId}`);
        if (!bookingRes.data?.success) throw new Error(bookingRes.data?.message || "Failed to fetch booking details.");
        setBooking(bookingRes.data.data);

        setSuccess(true);
      } catch (err: unknown) {
        let message = "Verification failed.";
        if (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "message" in err.response.data) {
          message = (err.response.data as { message?: string }).message || message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    verifyAll();
  }, [reference, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
        <p className="text-lg text-gray-700">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Verification Failed</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => router.refresh()} className="bg-blue-600 text-white">Retry</Button>
      </div>
    );
  }

  console.log(payment, booking, success);

  if (success && booking && payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center border border-blue-100">
          <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-2 text-center">Payment Successful!</h2>
          <p className="text-base md:text-lg text-gray-700 mb-6 text-center">Your booking and payment have been confirmed.</p>
          <div className="w-full flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Booking Details</h3>
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden mb-4">
                <tbody>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50 w-1/3">Booking ID</th><td className="py-2 px-3">{booking.id}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Property</th><td className="py-2 px-3">{booking.property?.title} ({booking.property?.address}, {booking.property?.city})</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Guests</th><td className="py-2 px-3">{booking.guests}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Check-in</th><td className="py-2 px-3">{new Date(booking.check_in).toLocaleDateString('en-GB')}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Check-out</th><td className="py-2 px-3">{new Date(booking.check_out).toLocaleDateString('en-GB')}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Total Price</th><td className="py-2 px-3">₦{Number(booking.total_price).toLocaleString()}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Booking Status</th><td className="py-2 px-3">{booking.status}</td></tr>
                  <tr><th className="py-2 px-3 font-medium bg-gray-50">Payment Status</th><td className="py-2 px-3">{booking.payment_status}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Payment Details</h3>
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden mb-4">
                <tbody>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50 w-1/3">Reference</th><td className="py-2 px-3">{payment.reference}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Amount</th><td className="py-2 px-3">₦{payment.amount}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Currency</th><td className="py-2 px-3">{payment.currency}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Paid At</th><td className="py-2 px-3">{new Date(payment.paid_at).toLocaleString('en-GB')}</td></tr>
                  <tr className="border-b"><th className="py-2 px-3 font-medium bg-gray-50">Channel</th><td className="py-2 px-3">{payment.payment_channel}</td></tr>
                  <tr><th className="py-2 px-3 font-medium bg-gray-50">Status</th><td className="py-2 px-3">{payment.payment_gateway_response}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <Button onClick={() => router.push("/properties/booking")} className="bg-blue-600 text-white w-full mt-2">Go to My Bookings</Button>
        </div>
      </div>
    );
  }

  if (success && (!booking || !payment)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600">Payment or booking details missing.</p>
      </div>
    );
  }

  return null;
} 
