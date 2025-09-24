"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Trash2, CircleCheck } from "lucide-react";
import { MediaUpload } from "./MediaUpload";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";
import { PrimaryButton } from "../ui/primaryButton";
import { ButtonSpinner } from "../ui";

export const HostOnboarding = ({
    setCurrentStep,
    onComplete,
}: {
    setCurrentStep: (step: string | null) => void;
    onComplete: () => void;
}) => {
    const [currentStep, setLocalStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [currentUploadType, setCurrentUploadType] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileUpload = (type: string, files: FileList) => {
        const file = files[0];
        if (file) {
            setUploadedFiles((prev) => ({
                ...prev,
                [type]: file,
            }));
        }
        setIsUploadModalOpen(false);
    };

    const handleDeleteFile = (type: string) => {
        setUploadedFiles((prev) => ({
            ...prev,
            [type]: null,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if required documents are uploaded
        const requiredDocs = ["government_id", "proof_of_address", "property_ownership"];
        const missingDocs = requiredDocs.filter(doc => !uploadedFiles[doc]);

        if (missingDocs.length > 0) {
            console.error(`Please upload the following required documents: ${missingDocs.join(", ")}`);
            return;
        }

        try {
            setIsSubmitting(true);

            // Start the identity verification step
            await axiosBase.post("/host/onboarding/start-step", {
                step: "identity_verification"
            });

            // Submit each document type separately
            for (const [type, file] of Object.entries(uploadedFiles)) {
                if (file) {
                    const formData = new FormData();
                    formData.append('type', type);
                    formData.append('documents[]', file);

                    await axiosBase.post("/host/documents", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                }
            }

            // toast.success("Documents submitted successfully!");
            // Move to the next step or redirect
            setCurrentStep(null);
            // Call onComplete to refresh the onboarding status
            onComplete();

        } catch (error) {
            console.error("please try again")
            throw error
        } finally {
            setIsSubmitting(false);
        }
    };

    const UploadButton = ({ type, label }: { type: string; label: string }) => {
        const file = uploadedFiles[type];

        return (
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full my-4 gap-4">
                    <span className="text-sm sm:text-base">{label}</span>
                    {!file ? (
                        <button
                            onClick={() => {
                                setCurrentUploadType(type);
                                setIsUploadModalOpen(true);
                            }}
                            className="w-full sm:w-auto cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-3 sm:py-2 rounded-md hover:bg-gray-50 flex items-center justify-center sm:justify-start gap-2"
                        >
                            <Upload size={16} />
                            Upload file
                        </button>
                    ) : (
                        <CircleCheck size={16} color="#06A2E2" className="mr-2" />
                    )}
                </div>
                {file && (
                    <div className="flex justify-between items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600 break-all">{file.name}</span>
                        <button
                            onClick={() => handleDeleteFile(type)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-[#EEEEEE] py-8 min-h-screen">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-[#EEEEEE]">
                <div className="mb-8">
                    <button
                        onClick={() => {
                            if (currentStep === 1) {
                                setCurrentStep(null);
                            } else {
                                setLocalStep(prev => prev - 1);
                            }
                        }}
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 p-2 cursor-pointer"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Go Back
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">Verify your identity</h1>
                        <p className="text-gray-600">Submit your valid documents to verify your identity</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                        <UploadButton
                            type="government_id"
                            label="1. Government-issued ID"
                        />
                        <UploadButton
                            type="proof_of_address"
                            label="2. Proof of address (utility bill)"
                        />
                        <UploadButton
                            type="property_ownership"
                            label="3. Property ownership documents rental or lease agreement"
                        />
                        <UploadButton
                            type="business_registration"
                            label="4. Business registration documents (optional if its a business)"
                        />
                        <UploadButton
                            type="tax_documents"
                            label="5. Tax documents (optional)"
                        />

                        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                            <PrimaryButton
                                onClick={() => console.log("Saving progress...")}
                                variant="secondary">Save and Exit
                            </PrimaryButton>

                            <PrimaryButton
                                disabled={isSubmitting}
                                onClick={() => console.log("Saving progress...")}
                                variant="primary">{isSubmitting ? <ButtonSpinner /> : "Submit"}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>

                <MediaUpload
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUpload={(files) => handleFileUpload(currentUploadType, files)}
                />
            </div>
        </div>

    );
};