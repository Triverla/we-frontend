"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { PrimaryButton } from "../ui/primaryButton";
// import { toast } from "sonner";
import { ButtonSpinner } from "../ui";
import { axiosBase } from "@woothomes/lib/axiosBase";

interface PropertyPhotosFormProps {
  onFinish: () => Promise<string>;
  onBack: () => void;
  onSaveAndExit: () => void;
  isLoading?: boolean;
}

export const PropertyPhotosForm = ({ onFinish, onBack, onSaveAndExit, isLoading }: PropertyPhotosFormProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (files: File[]): boolean => {
    // Check if files are images
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please upload only image files');
      return false;
    }

    // Check file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError('Some files are too large. Maximum size is 5MB per file');
      return false;
    }

    // Check total number of files
    if (photos.length + files.length > 20) {
      setError('Maximum 20 photos allowed');
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      if (validateFiles(files)) {
        setPhotos([...photos, ...files]);
        setError(null);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      if (validateFiles(filesArray)) {
        setPhotos([...photos, ...filesArray]);
        setError(null);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (photos.length < 4) {
      setError(`Please upload at least 4 photos. You currently have ${photos.length} photos.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFinish = async () => {
    if (!validateForm()) {
      console.error("Please upload at least 4 photos");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create property first and get the ID
      const propertyId = await onFinish();
      
      if (!propertyId) {
        throw new Error("Failed to get property ID");
      }

      // Prepare form data with all photos
      const formData = new FormData();
      
      // Add all images as an array
      photos.forEach((photo) => {
        formData.append("images[]", photo);
      });

      // Add tags as an array with a single value
      formData.append("tags[]", "other");

      console.log(formData);

      // Upload all photos at once
      const response = await axiosBase.post(`/properties/${propertyId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        },
      });

      // Handle partial success if some uploads failed
      if (response.data.failed_uploads?.length > 0) {
        console.error("Some images failed to upload. Please try again.");
        console.error("Failed uploads:", response.data.failed_uploads);
      } else {
        // toast.success("Photos uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Failed to upload photos. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">List Your First Property</h1>
          <p className="text-gray-600">List and manage your property, you can publish when ever your ready</p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="text-right mb-4">
            <span className="text-blue-500">Step 4 of 4</span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Upload 4 or more photos of your apartment <span className="text-red-500">*</span></h2>
              <p className="text-sm text-gray-500 mb-4">Click to upload, click and drag to reposition. You can add more or make changes later</p>
              {error && (
                <p className="text-red-500 text-sm mb-2">{error}</p>
              )}
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={URL.createObjectURL(photo)}
                        alt={`Property photo ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-white rounded-full py-1 px-3 shadow-md hover:bg-gray-100"
                        disabled={isLoading || isUploading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photos.length < 20 && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={isLoading || isUploading}
                      />
                      <div className="text-gray-500">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm">Add Photo</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
            <PrimaryButton
              type="submit"
              className="flex-1"
              disabled={isLoading || isUploading}
              onClick={onSaveAndExit}
              variant="secondary"
            >
              Save and Exit
            </PrimaryButton>

            <PrimaryButton
              type="submit"
              className="flex-1"
              onClick={handleFinish}
              disabled={isLoading || isUploading}
              variant="primary"
            >
              {isLoading || isUploading ? <ButtonSpinner /> : "Submit"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};