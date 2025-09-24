import React, { useState } from "react";
import ReceiptModal from "@woothomes/components/bookings/bookingReceipt";
import BookingTable from "@woothomes/components/bookings/bookings-table";
import { axiosBase } from "@woothomes/lib/axiosBase";
import { useQuery } from "@tanstack/react-query";

function BookingData() {
  const [selectedReceipt, setSelectedReceipt] = useState<number | null>(null);
  const { data } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await axiosBase.get("/bookings");
      console.log(res, " booking data");
      if (!res) throw new Error("Failed to fetch bookings");
      return res.data.data.bookings;
    },
  });
  return (
    <section>
      <BookingTable onViewReceipt={(i) => setSelectedReceipt(i)} />
      {selectedReceipt !== null && (
        <ReceiptModal
          booking={data[selectedReceipt]}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </section>
  );
}

export default BookingData;
