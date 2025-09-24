export interface PropertyData {
    title: string;
    description: string;
    property_type_id: string;
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    price_per_night: number;
    price_per_hour?: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    latitude: number;
    longitude: number;
    amenities?: string[];
    rules?: string[];
} 