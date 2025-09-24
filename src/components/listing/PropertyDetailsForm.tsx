"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@woothomes/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { usePropertyStore } from "@woothomes/store/usePropertyStore";
// import { toast } from "sonner";
import { PrimaryButton } from "../ui/primaryButton";
import { useAmenities } from "@woothomes/hooks/useHostData";

interface PropertyDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
  isLoading?: boolean;
}

export const PropertyDetailsForm = ({
  onNext,
  onBack,
  onSaveAndExit,
  isLoading,
}: PropertyDetailsFormProps) => {
  const { propertyData, setPropertyData } = usePropertyStore();
  const {
    data: amenities,
    isLoading: isLoadingAmenities,
    error: amenitiesError,
  } = useAmenities();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const guestOptions = Array.from({ length: 16 }, (_, i) => String(i + 1));
  const roomOptions = Array.from({ length: 8 }, (_, i) => String(i + 1));

  useEffect(() => {
    if (amenitiesError) {
      console.error("Failed to load amenities. Please try again.");
    }
  }, [amenitiesError]);

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = propertyData.amenities.includes(amenityId)
      ? propertyData.amenities.filter((id) => id !== amenityId)
      : [...propertyData.amenities, amenityId];

    setPropertyData({ amenities: newAmenities });

    // Clear error when user selects amenities
    if (errors.amenities) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.amenities;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!propertyData.max_guests) {
      newErrors.max_guests = "Number of guests is required";
    }

    if (!propertyData.bedrooms) {
      newErrors.bedrooms = "Number of bedrooms is required";
    }

    if (!propertyData.bathrooms) {
      newErrors.bathrooms = "Number of bathrooms is required";
    }

    if (!propertyData.amenities || propertyData.amenities.length === 0) {
      newErrors.amenities = "At least one amenity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
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
            List and manage your property, you can publish when ever your ready
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="text-right mb-4">
            <span className="text-blue-500">Step 2 of 4</span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium mb-2">
                  Number of guests <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(propertyData.max_guests)}
                  onValueChange={(value) => {
                    setPropertyData({ max_guests: parseInt(value) });
                    if (errors.max_guests) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.max_guests;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-full py-5 ${
                      errors.max_guests ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {guestOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.max_guests && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.max_guests}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium mb-2">
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(propertyData.bedrooms)}
                  onValueChange={(value) => {
                    setPropertyData({ bedrooms: parseInt(value) });
                    if (errors.bedrooms) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.bedrooms;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-full py-5 ${
                      errors.bedrooms ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bedrooms && (
                  <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium mb-2">
                  Bathrooms <span className="text-red-500">*</span>
                </label>
                <Select
                  value={String(propertyData.bathrooms)}
                  onValueChange={(value) => {
                    setPropertyData({ bathrooms: parseInt(value) });
                    if (errors.bathrooms) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.bathrooms;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-full py-5 ${
                      errors.bathrooms ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bathrooms && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bathrooms}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amenities <span className="text-red-500">*</span>
              </label>
              {isLoadingAmenities ? (
                <div className="text-center py-4 text-gray-500">
                  Loading amenities...
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {amenities?.map((amenity) => (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          propertyData.amenities.includes(amenity.id)
                            ? "bg-[#1E3A8A] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        disabled={isLoading}
                      >
                        {amenity.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.amenities && (
                <p className="text-red-500 text-xs mt-1">{errors.amenities}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
              <PrimaryButton
                type="submit"
                className="flex-1"
                disabled={isLoading}
                onClick={onSaveAndExit}
                variant="secondary"
              >
                Save and Exit
              </PrimaryButton>

              <PrimaryButton
                type="submit"
                className="flex-1"
                onClick={handleNext}
                disabled={isLoading}
                variant="primary"
              >
                Next
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
