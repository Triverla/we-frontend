"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  Users,
  Wallet,
  CircleChevronRight,
  CircleCheck,
  CalendarPlus,
} from "lucide-react";
import { HostOnboarding } from "./HostOnboarding";
import { PaymentSetup } from "./PaymentSetup";
import { PropertyListingContainer } from "../listing/PropertyListingContainer";
import { MetricCard } from "./MetricCard";
import { useAuthStore } from "@woothomes/store";
import { PrimaryButton } from "../ui/primaryButton";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";
import { OnboardingStatus } from "@woothomes/hooks/useHostData";

export const HostDashboard = () => {
  const { user } = useAuthStore((state) => state);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch onboarding status
  const { isLoading: isLoadingOnboarding } = useQuery({
    queryKey: ["onboardingStatus"],
    queryFn: async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await axiosBase.get<any>("/host/onboarding/status");
        setOnboardingStatus(response.data.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        throw error;
      }
    },
  });

  // Fetch dashboard data
  const { data, refetch: refetchDashboardData } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: async () => {
      try {
        const response = await axiosBase.get("/host/dashboard/overview");
        return response.data;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (!isLoadingOnboarding) {
      setIsLoading(false);
    }
  }, [isLoadingOnboarding]);

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const handleStepComplete = () => {
    // Refetch onboarding status and dashboard data
    refetchDashboardData();
    setCurrentStep(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "verify":
        return (
          <HostOnboarding
            setCurrentStep={setCurrentStep}
            onComplete={handleStepComplete}
          />
        );
      case "payment":
        return (
          <PaymentSetup
            setCurrentStep={setCurrentStep}
            onComplete={handleStepComplete}
          />
        );
      case "property":
        return (
          <PropertyListingContainer
            setCurrentStep={setCurrentStep}
            onComplete={handleStepComplete}
            refetchDashboardData={refetchDashboardData}
          />
        );
      default:
        return null;
    }
  };

  if (currentStep) {
    return renderStepContent();
  }

  const steps = [
    {
      id: "verify",
      title: "Verify Identity",
      isCompleted:
        onboardingStatus?.steps.identity_verification.completed || false,
    },
    {
      id: "payment",
      title: "Set Up Payment",
      isCompleted: onboardingStatus?.steps.payout_details.completed || false,
    },
    {
      id: "property",
      title: "List Property",
      isCompleted: onboardingStatus?.steps.first_property.completed || false,
    },
  ];

  const metrics = [
    {
      icon: <Home size={24} />,
      label: "Properties",
      value: data?.data.total_properties || 0,
      route: "/host/listings",
    },
    {
      icon: <Calendar size={24} />,
      label: "Active Booking",
      value: data?.data.active_bookings || 0,
      route: "",
    },
    {
      icon: <Users size={24} />,
      label: "Guests",
      value: 0,
      route: "",
    },
    {
      icon: <Wallet size={24} />,
      label: "Total Earnings",
      value: `₦${data?.data.total_earnings?.toLocaleString() || 0}`,
      route: "/host/earnings",
    },
    {
      icon: <CalendarPlus size={24} />,
      label: "Total Bookings",
      value: data?.data.total_bookings ?? 0,
      route: "/host/bookings",
    },
  ];

  return (
    <div className="bg-[#EEEEEE] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your properties and bookings
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <PrimaryButton onClick={() => router.push("/host/listings")}>
              List Property
            </PrimaryButton>
          </div>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-16" />
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Finish setting up your host account
                </h2>
                <span className="text-[#06A2E2]">
                  {data?.completion_percentage || 0}% Done
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            {isLoading ? (
              // Skeleton for steps
              [1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="flex-1 h-16" />
              ))
            ) : (
              // Actual steps
              <>
                {steps.map((step) => (
                  <PrimaryButton
                    variant={
                      steps.every((step) => step.isCompleted)
                        ? "primary"
                        : "secondary"
                    }
                    key={step.id}
                    onClick={() =>
                      !step.isCompleted && handleStepClick(step.id)
                    }
                    className={`flex-1`}
                    disabled={step.isCompleted}
                  >
                    <div
                      className={`${step.isCompleted ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          {step.title}
                        </h3>
                        {step.isCompleted ? (
                          <CircleCheck
                            color="white"
                            fill="#1E3A8A"
                            size={32}
                            strokeWidth={1}
                          />
                        ) : (
                          <CircleChevronRight
                            color="white"
                            size={32}
                            strokeWidth={1}
                            fill="#06A2E2"
                          />
                        )}
                      </div>
                    </div>
                  </PrimaryButton>
                ))}
                <div className="flex-1">
                  <PrimaryButton
                    variant={
                      steps.every((step) => step.isCompleted)
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() => {
                      if (steps.every((step) => step.isCompleted)) {
                        console.log("Finish onboarding");
                      } else {
                        console.error("Complete all the steps first");
                      }
                    }}
                  >
                    <div className="flex justify-center gap-3 items-center">
                      <span className="text-base sm:text-lg font-medium">
                        Finish
                      </span>
                    </div>
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? // Skeleton metrics
            [1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-16 mt-4 ml-9" />
              </div>
            ))
            : // Actual metrics
            metrics.map((metric, index) => (
              <div key={index} onClick={() => router.push(metric.route)}>
                <MetricCard
                  icon={metric.icon}
                  label={metric.label}
                  value={metric.value}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
