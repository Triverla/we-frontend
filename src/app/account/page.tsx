"use client";

import { CircleChevronRight, CircleCheck } from "lucide-react";
import AccountCard from "@woothomes/components/guest/AccountCard";
import AccountLayout from "@woothomes/components/account/AccountLayout";
import Image from "next/image";
import BookingData from "@woothomes/components/bookings/booking-data";
import { useAuthStore } from "@woothomes/store";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@woothomes/components";
import { User } from "@woothomes/types/account";
import { PrimaryButton } from "@woothomes/components/ui/primaryButton";
import Payment from "@woothomes/components/account/Payment";
import ProfilePicture from "@woothomes/components/account/Profilepicture";
import VerifyIdentity from "@woothomes/components/account/VerifyAccount";
import Profile from "@woothomes/components/account/Profile";
import Preferences from "@woothomes/components/account/preference";
import Security from "@woothomes/components/account/security";

export default function Account() {
  const { user } = useAuthStore((state) => state) as { user: User | null };
  const [progress, setProgress] = useState<number>(0);
  const [isLoading] = useState<boolean>(false);
  const [isError] = useState<boolean>(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  useEffect(() => {
    const calculateSetupProgress = () => {
      let count = 0;
      if (user?.name) count++;
      if (user?.avatar) count++;
      if (user?.profile.payment_methods) count++;
      setProgress((count / 3) * 100);
    };
    calculateSetupProgress();
  }, [user]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "verify":
        return (
          <AccountLayout
            title="Verify Your Information"
            paragraph="Complete your identity verification"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <VerifyIdentity />
          </AccountLayout>
        );
      case "profile_picture":
        return (
          <AccountLayout
            title="Add a Profile Picture"
            paragraph="Upload or update your profile picture"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <ProfilePicture />
          </AccountLayout>
        );
      case "payment":
        return (
          <AccountLayout
            title="Payment Method"
            paragraph="Manage your payment information"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <Payment />
          </AccountLayout>
        );
      case "profile":
        return (
          <AccountLayout
            title="My Profile"
            paragraph="View and update your information"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <Profile />
          </AccountLayout>
        );
      case "preference":
        return (
          <AccountLayout
            breadcrumb="Preferences"
            title="Preferences"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <Preferences />
          </AccountLayout>
        );
      case "payment":
        return (
          <AccountLayout
            breadcrumb="Payments"
            title="Payments"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <Payment />
          </AccountLayout>
        );
      case "securityQuestion":
        return (
          <AccountLayout
            breadcrumb="Security Settings"
            title="Security Settings"
            onBackClick={() => setActiveComponent(null)}
            width="max-w-4xl"
          >
            <Security />
          </AccountLayout>
        );
      default:
        return null;
    }
  };

  if (activeComponent) {
    return renderComponent();
  }

  return (
    <AccountLayout
      title="My Account"
      paragraph="Manage your account and profile details"
    >
      <div className="space-y-10">
        <section className="bg-white rounded-lg p-4 sm:p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              Finish setting up your account
            </h2>
            <span className="text-[#06A2E2]">{Math.round(progress)}% Done</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <PrimaryButton
              variant="secondary"
              onClick={() => setActiveComponent("verify")}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-[#1e3a8b]">
                  Verify Your Information
                </span>
                {user?.name ? (
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
            </PrimaryButton>

            <PrimaryButton
              variant="secondary"
              onClick={() => setActiveComponent("profile_picture")}
              disabled={!!user?.avatar}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-[#1e3a8b]">
                  Add a Profile Picture
                </span>
                {user?.avatar ? (
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
            </PrimaryButton>

            <PrimaryButton
              variant="secondary"
              onClick={() => setActiveComponent("payment")}
              disabled={!!user?.profile.payment_methods}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-[#1e3a8b]">
                  Payment Method
                </span>
                {user?.profile.payment_methods ? (
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
            </PrimaryButton>

            <PrimaryButton
              variant="secondary"
              onClick={() => (window.location.href = "/account/complete")}
              disabled={progress < 100}
            >
              <span className="font-extrabold text-sm text-[#1e3a8b]">
                Finish
              </span>
            </PrimaryButton>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row gap-6">
          <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center w-full md:max-w-3/12">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-[#06A2E2] text-4xl font-semibold mb-4">
              <Image
                src={user?.avatar || "/accountProfile.png"}
                alt="Profile avatar"
                height={97}
                width={97}
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              {user?.name || "Unnamed User"}
            </h3>
            <p className="text-sm text-gray-600">
              {user?.email || "wootlab@gmail.com"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            <AccountCard
              icon={
                <svg
                  className="w-8 h-8 bg-[#15a4de] text-white p-2 rounded-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              title="My Profile"
              description="View and update your information"
              onClick={() => setActiveComponent("profile")}
            />

            <AccountCard
              icon={
                <svg
                  className="w-8 h-8 bg-[#15a4de] text-white p-2 rounded-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              title="Preferences"
              description="Choose your preferences"
              onClick={() => setActiveComponent("preference")}
            />

            <AccountCard
              icon={
                <svg
                  className="w-8 h-8 bg-[#15a4de] text-white p-2 rounded-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              }
              title="Payments"
              description="View and update your payment information"
              onClick={() => setActiveComponent("payment")}
            />

            <AccountCard
              icon={
                <svg
                  className="w-8 h-8 bg-[#15a4de] text-white p-2 rounded-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zm7 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z"
                  />
                </svg>
              }
              title="Security Settings"
              description="Manage your security information"
              onClick={() => setActiveComponent("securityQuestion")}
            />
          </div>
        </section>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-12">
            Error fetching bookings
          </div>
        ) : (
          <BookingData />
        )}
      </div>
    </AccountLayout>
  );
}
