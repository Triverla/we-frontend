import { create } from "zustand";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";

interface PropertyFormData {
  title: string;
  description: string;
  property_type_id: string;
  rental_type_id?: string;
  room_type: "entire_home";
  bedrooms: number;
  beds: number;
  bathrooms: number;
  max_guests: number;
  price_per_night: number;
  price_per_hour?: number;
  minimum_hours?: number;
  hourly_start_time?: string;
  hourly_end_time?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  house_rules: string[];
  cancellation_policy: "flexible";
  rules?: string[];
}

interface PropertyStore {
  // State
  propertyData: PropertyFormData;
  propertyId: string | null;
  isLoading: boolean;
  photos: File[];

  // Actions
  setPropertyData: (data: Partial<PropertyFormData>) => void;
  setPhotos: (photos: File[]) => void;
  createProperty: () => Promise<string>;
  uploadPropertyImages: (propertyId: string) => Promise<void>;
  reset: () => void;
}

const initialPropertyData: PropertyFormData = {
  title: "",
  description: "",
  property_type_id: "",
  rental_type_id: undefined,
  room_type: "entire_home",
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  max_guests: 1,
  price_per_night: 0,
  price_per_hour: undefined,
  minimum_hours: undefined,
  hourly_start_time: undefined,
  hourly_end_time: undefined,
  address: "",
  city: "",
  state: "",
  country: "",
  zip_code: "",
  latitude: 0,
  longitude: 0,
  amenities: [],
  house_rules: [],
  cancellation_policy: "flexible",
  rules: [],
};

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  // State
  propertyData: initialPropertyData,
  propertyId: null,
  isLoading: false,
  photos: [],

  // Actions
  setPropertyData: (data) => {
    set((state) => ({
      propertyData: {
        ...state.propertyData,
        ...data,
      },
    }));
  },

  setPhotos: (photos) => {
    set({ photos });
  },

  createProperty: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosBase.post("/properties", get().propertyData);
      const propertyId = response.data.data.id;
      set({ propertyId });
      return propertyId;
    } catch (error) {
      console.error("Error creating property:", error);
      console.error("Failed to create property. Please try again.");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadPropertyImages: async (propertyId: string) => {
    const { photos } = get();
    if (!photos.length) return;

    set({ isLoading: true });
    try {
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("images[]", photo);
        formData.append("tags[]", "other");

        await axiosBase.post(`/properties/${propertyId}/images`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      // toast.success("Property images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading property images:", error);
      console.error("Failed to upload images. Please try again.");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      propertyData: initialPropertyData,
      propertyId: null,
      photos: [],
      isLoading: false,
    });
  },
}));
