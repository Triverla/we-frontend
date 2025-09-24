import { ApiMetaData, ApiProperty } from "@woothomes/hooks/useProperties";
import { create } from "zustand";

interface PropertyState {
  properties: ApiProperty[];
  meta: ApiMetaData;
  isLoading: boolean;
  isError: boolean;
  setProperties: (properties: ApiProperty[], meta: ApiMetaData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (isError: boolean) => void;
  updateProperty: (updatedProperty: ApiProperty) => void;
  reset: () => void;
}

export const useHostPropertiesStore = create<PropertyState>((set, get) => ({
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
  isLoading: false,
  isError: false,

  setProperties: (properties, meta) =>
    set({ properties, meta, isLoading: false, isError: false }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (isError) => set({ isError, isLoading: false }),

  updateProperty: (updatedProperty) => {
    const { properties } = get();

    const updatedProperties = properties.map((property) => {
      if (property.id === updatedProperty.id) {
        const filteredUpdates = Object.fromEntries(
          Object.entries(updatedProperty).filter(
            ([, value]) =>
              value !== null &&
              value !== "" &&
              !(Array.isArray(value) && value.length === 0)
          )
        );
        return { ...property, ...filteredUpdates };
      }
      return property;
    });

    set({ properties: updatedProperties });
  },

  reset: () =>
    set({
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
      isLoading: false,
      isError: false,
    }),
}));
