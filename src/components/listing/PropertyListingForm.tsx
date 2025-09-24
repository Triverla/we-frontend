/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Input } from "@woothomes/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@woothomes/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { usePropertyStore } from "@woothomes/store/usePropertyStore";
import { PrimaryButton } from "../ui/primaryButton";
// import { toast } from "sonner";
import { axiosBase } from "@woothomes/lib";
import { useQuery } from "@tanstack/react-query";

interface PropertyListingFormProps {
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  isLoading?: boolean;
}

interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

interface PropertyTypeResponse {
  success: boolean;
  message: string;
  data: PropertyType[];
}

const locationData = {
  countries: [
    {
      name: "Nigeria",
      states: [
        {
          name: "Lagos",
          cities: [
            "Agege",
            "Ajeromi-Ifelodun",
            "Alimosho",
            "Amuwo-Odofin",
            "Apapa",
            "Badagry",
            "Epe",
            "Eti-Osa",
            "Ibeju-Lekki",
            "Ifako-Ijaiye",
            "Ikeja",
            "Ikorodu",
            "Kosofe",
            "Lagos Island",
            "Lagos Mainland",
            "Mushin",
            "Ojo",
            "Oshodi-Isolo",
            "Shomolu",
            "Surulere",
          ],
        },
        {
          name: "Federal Capital Territory",
          cities: [
            "Abaji",
            "Abuja Municipal",
            "Bwari",
            "Gwagwalada",
            "Kuje",
            "Kwali",
          ],
        },
      ],
    },
  ],
};

export const PropertyListingForm = ({
  onNext,
  onBack,
  onSaveAndExit,
  isLoading,
}: PropertyListingFormProps) => {
  const { propertyData, setPropertyData } = usePropertyStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Fetch property types from API
  const { data: propertyTypesData, isLoading: isLoadingPropertyTypes } =
    useQuery({
      queryKey: ["propertyTypes"],
      queryFn: async () => {
        try {
          const response = await axiosBase.get<PropertyTypeResponse>(
            "/property-types"
          );
          return response.data;
        } catch (error) {
          console.error("Error fetching property types:", error);
          throw error;
        }
      },
    });

  // Fetch rental types from API
  const { data: rentalTypesData, isLoading: isLoadingRentalTypes } =
    useQuery({
      queryKey: ["propertyRentalTypes"],
      queryFn: async () => {
        const response = await axiosBase.get("/properties/rental-types");
        return response.data;
      },
    });

  const handleInputChange = (field: string, value: string | number) => {
    setPropertyData({ [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const selectedCountry = locationData.countries.find(
      (c) => c.name === propertyData.country
    );
    setAvailableStates(selectedCountry?.states.map((s) => s.name) || []);
    setAvailableCities([]);
    setPropertyData({ state: "", city: "" });
  }, [propertyData.country, setPropertyData]);

  useEffect(() => {
    const selectedCountry = locationData.countries.find(
      (c) => c.name === propertyData.country
    );
    const selectedState = selectedCountry?.states.find(
      (s) => s.name === propertyData.state
    );
    setAvailableCities(selectedState?.cities || []);
    setPropertyData({ city: "" });
  }, [propertyData.country, propertyData.state, setPropertyData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!propertyData.property_type_id) {
      newErrors.property_type_id = "Property type is required";
    }

    if (!propertyData.rental_type_id) {
      newErrors.rental_type_id = "Rental type is required";
    }

    if (!propertyData.title || propertyData.title.trim() === "") {
      newErrors.title = "Property title is required";
    }

    if (!propertyData.description || propertyData.description.trim() === "") {
      newErrors.description = "Property description is required";
    }

    if (!propertyData.address || propertyData.address.trim() === "") {
      newErrors.address = "Property address is required";
    }

    if (!propertyData.country) {
      newErrors.country = "Country is required";
    }

    if (!propertyData.state) {
      newErrors.state = "State is required";
    }

    if (!propertyData.city) {
      newErrors.city = "City is required";
    }

    if (!propertyData.zip_code || propertyData.zip_code.trim() === "") {
      newErrors.zip_code = "ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onNext();
    } else {
      console.error("Please fill in all required fields");
    }
  };

  return (
    <div className="bg-[#EEEEEE] py-8 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-[#EEEEEE]">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex cursor-pointer items-center text-gray-600 hover:text-gray-800 p-2"
            disabled={isLoading}
          >
            <ArrowLeft size={20} className="mr-2" />
            Go Back
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">
            List Your First Property
          </h1>
          <p className="text-gray-600">
            List and manage your property, you can publish when ever you are
            ready
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="text-right mb-4">
            <span className="text-blue-500">Step 1 of 4</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={propertyData.property_type_id}
                  onValueChange={(value) =>
                    handleInputChange("property_type_id", value)
                  }
                  disabled={isLoadingPropertyTypes}
                >
                  <SelectTrigger
                    className={`w-full py-6 ${
                      errors.property_type_id ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingPropertyTypes
                          ? "Loading property types..."
                          : "Select property type"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypesData?.data.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_type_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.property_type_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rental Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={propertyData.rental_type_id}
                  onValueChange={(value) => handleInputChange("rental_type_id", value)}
                  disabled={isLoadingRentalTypes}
                >
                  <SelectTrigger className={`w-full py-6 ${errors.rental_type_id ? "border-red-500" : ""}`}>
                    <SelectValue placeholder={isLoadingRentalTypes ? "Loading rental types..." : "Select rental type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {rentalTypesData?.data.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rental_type_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.rental_type_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="eg. Hampton Villa"
                  value={propertyData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full py-6 ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Description <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter a description of your property"
                  value={propertyData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full py-6 ${
                    errors.description ? "border-red-500" : ""
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Where is this property located?{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Your address is only shared with guests after they have
                    made a reservation)
                  </span>
                </label>
                <Input
                  placeholder="eg. 29 usuma street, off gana, maitama"
                  value={propertyData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full mb-4 py-6 ${
                    errors.address ? "border-red-500" : ""
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 mb-2">
                    {errors.address}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Select
                      value={propertyData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                    >
                      <SelectTrigger
                        className={`w-full py-6 ${
                          errors.country ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.countries.map((country) => (
                          <SelectItem key={country.name} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>
                  <div>
                    <Select
                      value={propertyData.state}
                      onValueChange={(value) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger
                        className={`w-full py-6 ${
                          errors.state ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={propertyData.city}
                      onValueChange={(value) =>
                        handleInputChange("city", value)
                      }
                    >
                      <SelectTrigger
                        className={`w-full py-6 ${
                          errors.city ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="ZIP Code"
                      value={propertyData.zip_code}
                      onChange={(e) =>
                        handleInputChange("zip_code", e.target.value)
                      }
                      className={`w-full py-6 ${
                        errors.zip_code ? "border-red-500" : ""
                      }`}
                    />
                    {errors.zip_code && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.zip_code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
              <PrimaryButton
                className="flex-1"
                disabled={isLoading}
                onClick={onSaveAndExit}
                variant="secondary"
              >
                Save and Exit
              </PrimaryButton>

              <PrimaryButton
                type="submit"
                className="disabled:opacity-50 flex-1"
                disabled={isLoading}
                variant="primary"
              >
                Next
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
