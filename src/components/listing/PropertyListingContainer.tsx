"use client";

import { useState } from "react";
import { PropertyListingForm } from "./PropertyListingForm";
import { PropertyDetailsForm } from "./PropertyDetailsForm";
import { PropertyPhotosForm } from "./PropertyPhotosForm";
import { PropertyPricingForm } from "./PropertyPricingForm";
import { usePropertyStore } from "@woothomes/store/usePropertyStore";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";
import { useHostPropertiesStore } from "@woothomes/store";

export const PropertyListingContainer = ({
  setCurrentStep,
  onComplete,
  refetchDashboardData,
}: {
  setCurrentStep: (value: string | null) => void;
  onComplete: () => void;
  refetchDashboardData: () => void;
}) => {
  const [step, setStep] = useState(1);
  const { createProperty, uploadPropertyImages, reset, isLoading } =
    usePropertyStore();

  const { properties, meta } = useHostPropertiesStore();

  console.log({ properties, meta });

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      setCurrentStep(null);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleSaveAndExit = () => {
    reset();
    setCurrentStep(null);
  };

  const handleFinish = async () => {
    try {
      // Start the first property step
      await axiosBase.post("/host/onboarding/start-step", {
        step: "first_property",
      });

      // Create the property first
      const propertyId = await createProperty();

      // Then upload the images
      await uploadPropertyImages(propertyId);

      // Reset the store and redirect
      reset();
      setCurrentStep(null);
      // Call onComplete to refresh the onboarding status
      onComplete();
      await refetchDashboardData();
      // toast.success("Property created successfully!");
      
      return propertyId;
    } catch (error) {
      console.error("Error creating property:", error);
      // Error handling is done in the store actions
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && (
        <PropertyListingForm
          onNext={handleNext}
          onSaveAndExit={handleSaveAndExit}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}
      {step === 2 && (
        <PropertyDetailsForm
          onNext={handleNext}
          onBack={handleBack}
          onSaveAndExit={handleSaveAndExit}
          isLoading={isLoading}
        />
      )}
      {step === 3 && (
        <PropertyPricingForm
          onNext={handleNext}
          onBack={handleBack}
          onSaveAndExit={handleSaveAndExit}
          isLoading={isLoading}
        />
      )}
      {step === 4 && (
        <PropertyPhotosForm
          onFinish={handleFinish}
          onBack={handleBack}
          onSaveAndExit={handleSaveAndExit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
