/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserProfile {
  id: string;
  email?: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  profile: any;
  preferred_language: string;
  preferred_currency: string;
  notification_sms: boolean;
  notification_email: boolean;
  notification_push: boolean;
  payment_method: any | null;
}

export interface PaymentMethod {
  card_holder: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
  billing_address: {
    street: string;
    house_number: string;
    city: string;
    country: string;
    zip_code: string;
  };
}


interface Profile {
  address: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  created_at: string | null;
  currency: string | null;
  date_of_birth: string | null;
  gender: string | null;
  host_status: string | null;
  host_verification_documents: string | null;
  host_verified: boolean;
  language: string | null;
  notification_preferences: string | null;
  payment_methods: string | null;
  state: string | null;
  tax_information: string | null;
  timezone: string | null;
  updated_at: string | null;
  zip_code: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
  email_verified: boolean;
  phone_verified: boolean;
  avatar: string | null;
  social_type: string | null;
  profile: Profile;
}