"use client";

import { useState } from "react";
import { PrimaryButton } from "@woothomes/components/ui/primaryButton";
import { Input } from "@woothomes/components/ui/input";
import { useAuthStore } from "@woothomes/store";
import Image from "next/image";
// import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib/axiosBase";

export default function VerifyIdentity() {
  const { user } = useAuthStore((state) => state);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone || "",
    address: user?.profile.address || "",
    gender: user?.profile.gender || ""
  });
  const [tempData, setTempData] = useState({ ...formData });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { first_name: string; last_name: string; phone: string }) => {
      const response = await axiosBase.put("/profile", payload);
      return response.data;
    },
    onSuccess: () => {
      // toast.success("Profile updated successfully");
      setIsEditing(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
      console.error(error.message || "Failed to update profile");
    },
  });

  const handleFieldChange = (field: string, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldSave = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: tempData[field as keyof typeof tempData]
    }));
    setIsEditing(null);
  };

  const handleSave = () => {
    const nameParts = formData.full_name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone: formData.phone_number,
      address: formData.address,
      gender: formData.gender,
    };

    updateProfileMutation.mutate(payload);
  };

  const handleCancel = () => {
    setTempData({ ...formData });
    setIsEditing(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <label className="block font-medium text-gray-900 mb-2">
            Full Name
          </label>
          <div className="relative">
            {isEditing === "full_name" ? (
              <div className="flex items-center">
                <Input
                  type="text"
                  value={tempData.full_name}
                  onChange={(e) => handleFieldChange("full_name", e.target.value)}
                  className="block p-4 w-full bg-[#f8f7fe] border-gray-200 rounded-md focus:ring-[#06A2E2] pr-20"
                />
                <button
                  onClick={() => handleFieldSave("full_name")}
                  className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Input
                  type="text"
                  value={formData.full_name}
                  disabled
                  className="block p-4 w-full bg-[#F7F7FD] border-gray-200 rounded-md text-gray-900 pr-20"
                />
                <button
                  onClick={() => setIsEditing("full_name")}
                  className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-900 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              value={formData.email}
              disabled
              className="block p-4 w-full bg-[#F7F7FD] border-gray-200 rounded-md text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-900 mb-2">
            Phone Number
          </label>
          <div className="relative">
            {isEditing === "phone_number" ? (
              <div className="flex items-center">
                <div className="flex items-center w-full">
                  <span className="mr-2">
                    <Image
                      src="/payment/flag.png"
                      alt="Nigeria flag"
                      width={20}
                      height={20}
                    />
                  </span>
                  <Input
                    type="text"
                    value={tempData.phone_number}
                    onChange={(e) => handleFieldChange("phone_number", e.target.value)}
                    className="block p-4 w-full bg-[#f8f7fe] border-gray-200 rounded-md focus:ring-[#06A2E2] pr-20"
                  />
                </div>
                <button
                  onClick={() => handleFieldSave("phone_number")}
                  className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex items-center w-full">
                  <span className="mr-2">
                    <Image
                      src="/payment/flag.png"
                      alt="Nigeria flag"
                      width={20}
                      height={20}
                    />
                  </span>
                  <Input
                    type="text"
                    value={formData.phone_number}
                    disabled
                    className="block p-4 w-full bg-[#F7F7FD] border-gray-200 rounded-md text-gray-900 pr-20"
                  />
                </div>
                <button
                  onClick={() => setIsEditing("phone_number")}
                  className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Address
            </label>
            <div className="relative">
              {isEditing === "address" ? (
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={tempData.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    className="block p-4 w-full bg-[#f8f7fe] border-gray-200 rounded-md focus:ring-[#06A2E2] pr-20"
                  />
                  <button
                    onClick={() => handleFieldSave("address")}
                    className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={formData.address}
                    disabled
                    className="block p-4 w-full bg-[#F7F7FD] border-gray-200 rounded-md text-gray-900 pr-20"
                  />
                  <button
                    onClick={() => setIsEditing("address")}
                    className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Gender
            </label>
            <div className="relative">
              {isEditing === "gender" ? (
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={tempData.gender}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                    className="block p-4 w-full bg-[#f8f7fe] border-gray-200 rounded-md focus:ring-[#06A2E2] pr-20"
                  />
                  <button
                    onClick={() => handleFieldSave("gender")}
                    className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={formData.gender}
                    disabled
                    className="block p-4 w-full bg-[#F7F7FD] border-gray-200 rounded-md text-gray-900 pr-20"
                  />
                  <button
                    onClick={() => setIsEditing("gender")}
                    className="absolute right-2 text-[#06A2E2] cursor-pointer underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <PrimaryButton
            onClick={handleSave}
            className="flex-1 bg-[#06A2E2] text-white py-2 px-4 rounded-md hover:bg-[#0588c0] transition-colors"
          >
            Save
          </PrimaryButton>
          <PrimaryButton
            onClick={handleCancel}
            variant="secondary"
            className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
