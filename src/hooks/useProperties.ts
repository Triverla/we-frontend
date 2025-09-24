import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";
import { useHostPropertiesStore } from "@woothomes/store";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ApiMetaData {
  current_page: number;
  from: number;
  last_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number;
  total: number;
  has_more_pages: boolean;
}
export interface ApiProperty {
  id: string;
  title: string;
  description: string;
  type: string | null;
  price_per_night: number;
  price_per_hour: number;
  bedrooms: number;
  isFavorite?: boolean;
  bathrooms: number;
  guests: number;
  address: string;
  city: string;
  state: string;
  country: string;
  user_id?: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  rating: number;
  reviews_count: number;
  reviews: number;
  rules: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  images: {
    id: string;
    image_url: string;
    is_primary: boolean;
    tag: string;
  }[];
  property_type?: string | undefined;
  user?: User;
  host?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  amenities: (
    | string
    | { id: string; name: string; icon?: string; category?: string }
  )[];
  rental_type: {
    slug: string;
  }
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    properties: ApiProperty[];
    meta: ApiMetaData;
    stats: {
      total_published: number;
      total_unpublished: number;
      total_occupied: number;
      total_daily: number;
      total_hourly: number;
    };
  };
}

export interface UsePropertiesResponse {
  properties: ApiProperty[];
  meta: ApiMetaData;
  stats: {
    total_published: number;
    total_unpublished: number;
    total_occupied: number;
    total_daily: number;
    total_hourly: number;
  };
}

export interface UsePropertiesInterface {
  page: number;
  filter?: string;
  url?: string;
}

export function useProperties({
  page,
  filter,
  url,
}: UsePropertiesInterface): UseQueryResult<UsePropertiesResponse> {
  const setProperties = useHostPropertiesStore((state) => state.setProperties);
  return useQuery({
    queryKey: ["properties", page, url, filter],
    queryFn: async () => {
      // Determine the base URL
      const baseUrl = url || "/host/properties";
      let finalUrl = `${baseUrl}?page=${page}&per_page=12`;

      // Add filter parameters
      if (filter === "Published") {
        finalUrl += "&status=published";
      } else if (filter === "Unpublished") {
        finalUrl += "&status=unpublished";
      } else if (filter === "Currently Occupied") {
        finalUrl += "&occupied=true";
      } else if (filter === "Not Occupied") {
        finalUrl += "&occupied=false";
      }

      const response = await axiosBase.get<ApiResponse>(finalUrl);

      if (!response?.data?.data?.properties) {
        return {
          properties: [],
          meta: {
            last_page: 1,
            total: 0,
            current_page: 1,
            from: 0,
            to: 0,
            per_page: 10,
            path: "",
            links: [],
            has_more_pages: false,
          },
          stats: {
            total_published: 0,
            total_unpublished: 0,
            total_occupied: 0,
            total_daily: 0,
            total_hourly: 0
          }
        };
      }

      const { data } = response.data;
      console.log('API Response:', response.data); // Add this to debug

      setProperties(data.properties, data.meta);

      return {
        properties: data.properties,
        meta: data.meta,
        stats: data.stats || {
          total_published: 0,
          total_unpublished: 0,
          total_occupied: 0,
          total_daily: 0,
          total_hourly: 0
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useProperty(
  id: string,
  url?: string
): UseQueryResult<ApiProperty> {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await axiosBase.get<{ data: ApiProperty }>(
        `${url ? url : "/properties"}/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

interface PropertySettings {
  minimum_offer_percentage: number;
  maximum_offer_percentage: number;
  auto_accept_offers: boolean;
  require_guest_verification: boolean;
  minimum_stay_nights: number;
  maximum_stay_nights: number;
  advance_notice_hours: number;
  offer_expiration_hours: number;
}

interface CreatePropertyData {
  title: string;
  description: string;
  type?: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude?: string;
  longitude?: string;
  rules?: string;
  status?: string;
  property_settings?: PropertySettings;
}

// Replace the empty interface with a type alias
type UpdatePropertyData = Partial<CreatePropertyData>;

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyData: CreatePropertyData) => {
      const response = await axiosBase.post("/properties", propertyData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePropertyData;
    }) => {
      const response = await axiosBase.put(`/host/properties/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosBase.delete(`/host/properties/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUnpublishProperty() {
  const updateProperty = useHostPropertiesStore(
    (state) => state.updateProperty
  );

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosBase.put(`/host/properties/${id}/unpublish`);
      return response.data;
    },
    onSuccess: (data) => {
      updateProperty(data.data);
    },
  });
}

export function usePublishProperty() {
  const updateProperty = useHostPropertiesStore(
    (state) => state.updateProperty
  );

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosBase.put(`/host/properties/${id}/publish`);
      return response.data;
    },
    onSuccess: (data) => {
      updateProperty(data.data);
    },
  });
}

export function useDeletePropertyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, imageId }: { propertyId: string; imageId: string }) => {
      const response = await axiosBase.delete(`/host/properties/${propertyId}/images/${imageId}`);
      return response.data;
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, imageId }: { propertyId: string; imageId: string }) => {
      const response = await axiosBase.put(`/host/properties/${propertyId}/images/${imageId}/primary`);
      return response.data;
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
}

export function useReorderImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, imageIds }: { propertyId: string; imageIds: string[] }) => {
      const response = await axiosBase.put(`/host/properties/${propertyId}/images/reorder`, { image_ids: imageIds });
      return response.data;
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
}
