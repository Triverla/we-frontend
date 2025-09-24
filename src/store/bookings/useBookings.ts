// store/bookings.ts
import { create } from "zustand";
import { Booking, BookingMeta } from "./bookings.interface";

export interface BookingState {
  bookings: Booking[];
  meta: BookingMeta | null;
  isLoading: boolean;
  error: string | null;
  setBookings: (bookings: Booking[], meta: BookingMeta) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useBookingsStore = create<BookingState>((set) => ({
  bookings: [],
  meta: null,
  isLoading: false,
  error: null,
  setBookings: (bookings, meta) =>
    set({ bookings, meta, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ bookings: [], meta: null, isLoading: false, error: null }),
}));
