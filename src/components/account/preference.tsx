"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
// import { toast } from "sonner";
import { axiosBase } from "@woothomes/lib";
import { LoadingSpinner } from "@woothomes/components";
import { useAuthStore } from "@woothomes/store";

interface PreferencesState {
  preferred_language: string;
  preferred_currency: string;
  sms: boolean;
  email: boolean;
  push: boolean;
}

export default function Preferences() {
  const { user } = useAuthStore((state) => state) as {
    user: {
      profile: {
        notification_preferences: { sms: boolean; email: boolean; push: boolean } | null;
        currency: string | null;
        language: string | null;
      } | null;
    } | null;
  };

  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState<PreferencesState>({
    preferred_language: user?.profile?.language || "English (Default)",
    preferred_currency: user?.profile?.currency || "NGN",
    sms: user?.profile?.notification_preferences?.sms || false,
    email: user?.profile?.notification_preferences?.email || true,
    push: user?.profile?.notification_preferences?.push || true,
  });

  const mutation = useMutation({
    mutationFn: async (updated: PreferencesState) => {
      const payload = {
        profile: {
          notification_preferences: {
            sms: updated.sms,
            email: updated.email,
            push: updated.push,
          },
          currency: updated.preferred_currency,
          language: updated.preferred_language,
        },
      };

      const res = await axiosBase.put("/profile", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // toast.success("Preferences updated successfully");
    },
    onError: () => {
      console.error("Failed to update preferences");
    },
  });

  if (!user) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="space-y-6">
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Language
          </label>
          <select
            value={preferences.preferred_language}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                preferred_language: e.target.value,
              }))
            }
            className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-[#15a4de] py-4 px-3 cursor-pointer"
          >
            <option>English (Default)</option>
            <option>French</option>
            <option>Spanish</option>
          </select>
        </div>

        {/* Currency Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Currency
          </label>
          <select
            value={preferences.preferred_currency}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                preferred_currency: e.target.value,
              }))
            }
            className="mt-1 block w-full bg-[#f8f7fe] border-0 rounded-md focus:ring-[#15a4de] py-4 px-3 cursor-pointer"
          >
            <option value="NGN">Nigerian Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            How would you like to receive notifications?
          </h3>
          <div className="space-y-6">
            {[
              { label: "SMS", key: "sms" },
              { label: "Push Notifications", key: "push" },
              { label: "Email", key: "email" },
            ].map(({ label, key }) => (
              <div className="flex items-center justify-between" key={key}>
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof PreferencesState],
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${preferences[key as keyof PreferencesState]
                    ? "bg-[#15a4de]"
                    : "bg-gray-200"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[key as keyof PreferencesState]
                      ? "translate-x-6"
                      : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-6">
          <button
            onClick={() => mutation.mutate(preferences)}
            disabled={mutation.isPending}
            className="flex-1 bg-[#0ea2e2] text-white py-2 px-4 rounded-md transition-colors"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => window.location.href = "/account"}
            className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}