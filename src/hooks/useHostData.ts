import { useQuery } from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";

interface OnboardingStep {
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

export interface OnboardingStatus {
  completion_percentage: number;
  steps: {
    first_property: OnboardingStep;
    payout_details: OnboardingStep;
    identity_verification: OnboardingStep;
  };
  started_at: string;
  completed_at: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  guest_name: string;
  created_at: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface DashboardData {
  total_properties: number;
  active_bookings: number;
  total_earnings: number;
  upcoming_bookings: number;
  average_rating: number | null;
  recent_reviews: Review[];
  recent_messages: Message[];
}

interface BookingRequest {
  id: string;
  property_id: string;
  user_id: string;
  host_id: string;
  is_hourly: boolean;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  special_requests: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    is_hourly_rental: boolean;
    primary_image: {
      id: string;
      image_url: string;
      is_primary: boolean;
    };
    images: Array<{
      id: string;
      image_url: string;
      is_primary: boolean;
    }>;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BookingRequestsResponse {
  booking_requests: BookingRequest[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
    has_more_pages: boolean;
  };
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const response = await axiosBase.get<{ data: Amenity[] }>("/amenities");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


export function useHostOnboardingStatus() {
  return useQuery<OnboardingStatus, Error>({
    queryKey: ["hostOnboardingStatus"],
    queryFn: async () => {
      const response = await axiosBase.get<ApiResponse<OnboardingStatus>>(
        "/host/onboarding/status"
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}

export function useHostDashboardData() {
  return useQuery<DashboardData, Error>({
    queryKey: ["hostDashboardData"],
    queryFn: async () => {
      const response = await axiosBase.get<ApiResponse<DashboardData>>(
        "/host/dashboard/overview"
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHostBookingRequests(status: "all" | "new" = "new", page: number = 1) {
  return useQuery<BookingRequestsResponse, Error>({
    queryKey: ["hostBookingRequests", status, page],
    queryFn: async () => {
      const filter = status === "new" ? "?status=new" : "?status=all";
      const response = await axiosBase.get<ApiResponse<BookingRequestsResponse>>(
        `/host/booking-requests${filter}&page=${page}`
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}

export function useHostData() {
  const onboardingStatus = useHostOnboardingStatus();
  const dashboardData = useHostDashboardData();
  
  return {
    onboardingStatus,
    dashboardData,
    useHostBookingRequests, 
  };
}