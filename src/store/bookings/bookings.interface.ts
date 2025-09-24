// types/bookings.ts
export interface BookingImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  tag: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  is_hourly_rental: boolean;
  images: BookingImage[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Host {
  id: string;
  name: string;
  email: string;
}

export interface Booking {
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
  user: User;
  host: Host;
}

export interface BookingMeta {
  last_page: number;
  total: number;
  current_page: number;
  from: number;
  to: number;
  per_page: number;
  path: string;
  links: string[];
  has_more_pages: boolean;
}

export interface UseBookingsResponse {
  bookings: Booking[];
  meta: BookingMeta;
}

export interface BookingFilters {
  status?: string;
  payment_status?: string;
  property_type?: string;
  type?: "host" | "guest";
  start_date?: string;
  end_date?: string;
}

export interface UseBookingsInterface {
  page: number;
  filter?: BookingFilters;
  url?: string;
}
