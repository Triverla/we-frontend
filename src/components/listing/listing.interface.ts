export interface Property {
  id: string;
  title: string;
  location: string;
  price_per_night: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  rating: number;
  reviews_count: number;
  isFavorite: boolean;
  images: string[];
  city: string;
  state: string;
  country: string;
  address: string;
  reviews: number;
  status: string;
  amenities: (
    | string
    | { id: string; name: string; icon?: string; category?: string }
  )[];
}
