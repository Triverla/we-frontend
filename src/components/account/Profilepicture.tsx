"use client";

import { Input } from "@woothomes/components";
import { useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { axiosBase } from "@woothomes/lib/axiosBase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    avatar_url: string;
  };
}

export default function ProfilePicture() {
  const [showCamera, setShowCamera] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosBase.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      console.error(
        `Failed to upload avatar: ${error.message || "Unknown error"}`
      );
    },
  });

  const handleTakePhoto = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const blob = await (await fetch(imageSrc)).blob();
        const file = new File([blob], "captured-avatar.jpg", {
          type: "image/jpeg",
        });

        setAvatarPreview(imageSrc);
        uploadMutation.mutate(file);
      }
      setShowCamera(false);
    }
  }, [uploadMutation]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="relative bg-white rounded-lg p-8 text-center">
      {uploadMutation.isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="mb-8">
        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden">
          {showCamera ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
          ) : avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="Profile avatar"
              height={128}
              width={128}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              src="/accountProfile.png"
              alt="Profile avatar placeholder"
              height={128}
              width={128}
              className="object-cover w-full h-full"
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {showCamera ? (
          <button
            onClick={handleTakePhoto}
            className="w-1/2 bg-[#0ea2e2] text-white py-2 px-4 rounded-md hover:bg-[#0c8ac1]"
            disabled={uploadMutation.isPending}
          >
            Take photo
          </button>
        ) : (
          <button
            onClick={() => setShowCamera(true)}
            className="w-1/2 bg-[#0ea2e2] text-white py-2 px-4 rounded-md hover:bg-[#0c8ac1]"
            disabled={uploadMutation.isPending}
          >
            Take photo
          </button>
        )}

        <div className="relative flex justify-center items-center">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload"
            disabled={uploadMutation.isPending}
          />
          <label
            htmlFor="photo-upload"
            className="block w-1/2 bg-[#0ea2e2] text-white py-2 px-4 rounded-md hover:bg-[#0c8ac1] cursor-pointer"
          >
            Choose Photo From Library
          </label>
        </div>

        {showCamera && (
          <button
            onClick={() => setShowCamera(false)}
            className="w-1/2 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50"
            disabled={uploadMutation.isPending}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
