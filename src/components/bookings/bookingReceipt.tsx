/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
// import { useReactToPrint } from "react-to-print";

export default function ReceiptModal({
  booking,
  onClose,
}: {
  booking: any;
  onClose: () => void;
}) {
  const printRef = useRef(null);
  //   const handlePrint = useReactToPrint({ content: () => printRef.current });

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        ref={printRef}
        className="bg-white rounded-lg w-full max-w-xl p-8 border-2 border-blue-500 relative"
      >
        <h3 className="text-blue-900 font-bold text-lg mb-4">Receipt</h3>
        <div className="mb-4">
          <p className="text-sm font-semibold">Billed to</p>
          <p className="font-bold text-lg">{booking.hostName}</p>
          <p className="text-sm">Address: 24 Benue Street, Maitama</p>
          <p className="text-sm">Email: joy@email.com</p>
          <p className="text-sm">Phone: +234 808 1234 567</p>
          <p className="text-sm">Payment ID: 0001</p>
          <p className="text-sm">Payment Date: 20/02/2025</p>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm font-semibold">Payment Summary</p>
          <p className="text-sm">Property: {booking.property}</p>
          <p className="text-sm">Check In: {booking.checkIn}</p>
          <p className="text-sm">Check Out: {booking.checkOut}</p>
          <p className="text-sm">Price Per Night: ₦{booking.price}</p>
          <p className="text-sm">Number of Nights: 5 Nights</p>
          <p className="text-sm font-bold">Total Price: ₦500,000</p>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          If you have any questions regarding this receipt, please contact us at{" "}
          <a
            className="text-blue-600 underline"
            href="mailto:support@woothomes.com"
          >
            support@woothomes.com
          </a>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            // onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Export as PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
