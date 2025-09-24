"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { PrimaryButton } from "../ui/primaryButton";
import { axiosBase } from "@woothomes/lib";
import { toast } from "sonner";

interface PaymentMethod {
    id: string;
    name: string;
    logo: string;
    comingSoon?: boolean;
}

export const PaymentSetup = ({
    setCurrentStep,
    onComplete
}: {
    setCurrentStep: (step: string | null) => void;
    onComplete: () => void;
}) => {
    const [currentStep, setLocalStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState<string>("bank");
    const [formData, setFormData] = useState({
        bank: "",
        accountNumber: "",
        sortCode: "",
        acceptedTerms: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const paymentMethods: PaymentMethod[] = [
        { id: "payoneer", name: "Payoneer", logo: "/payment/payoneer.svg", comingSoon: true },
        { id: "paypal", name: "Paypal", logo: "/payment/paypal.svg", comingSoon: true },
        { id: "bank", name: "Bank Transfer", logo: "/payment/bank.svg" }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.bank) {
            newErrors.bank = "Bank is required";
        }

        if (!formData.accountNumber) {
            newErrors.accountNumber = "Account number is required";
        } else if (formData.accountNumber.length !== 10) {
            newErrors.accountNumber = "Account number must be 10 digits";
        }

        if (!formData.sortCode) {
            newErrors.sortCode = "Sort code is required";
        } else if (formData.sortCode.length !== 6) {
            newErrors.sortCode = "Sort code must be 6 digits";
        }

        if (!formData.acceptedTerms) {
            newErrors.acceptedTerms = "You must accept the terms and policies";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedMethod === "bank" && !validateForm()) {
            toast.error("Please fill in all required fields correctly");
            return;
        }

        try {
            // Start the payout details step
            await axiosBase.post("/host/onboarding/start-step", {
                step: "payout_details"
            });

            console.log("Form submitted", { selectedMethod, formData });

            // Call onComplete to notify parent component
            onComplete();
        } catch (error) {
            console.error("Error submitting payment details:", error);
            console.error("Failed to submit payment details. Please try again.");
        }
    };

    const handleMethodSelect = (methodId: string) => {
        const method = paymentMethods.find(m => m.id === methodId);
        if (method?.comingSoon) {
            toast.info("This payment method is coming soon!");
            return;
        }
        setSelectedMethod(methodId);
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
                        className="inline-flex items-center cursor-pointer text-gray-600 hover:text-gray-800 p-2"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Go Back
                    </button>
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">Set Up Payment Method</h1>
                    <p className="text-gray-600">Set up and manage your payment and payout method</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">Select your preferred payout method</h2>
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors relative
                                            ${selectedMethod === method.id ? 'border-[#06A2E2] bg-blue-50' : 'border-gray-200'}
                                            ${method.comingSoon ? 'opacity-70' : ''}`}
                                        onClick={() => handleMethodSelect(method.id)}
                                    >
                                        {method.comingSoon && (
                                            <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-bl-lg">
                                                Coming Soon
                                            </div>
                                        )}
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={selectedMethod === method.id}
                                            onChange={() => handleMethodSelect(method.id)}
                                            className="sr-only"
                                            disabled={method.comingSoon}
                                        />
                                        <div className="flex items-center justify-between">
                                            <Image
                                                src={method.logo}
                                                alt={method.name}
                                                width={32}
                                                height={32}
                                                className="mr-4"
                                            />
                                            <span className="font-medium">{method.name}</span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                ${selectedMethod === method.id ? 'border-[#06A2E2]' : 'border-gray-300'}`}>
                                                {selectedMethod === method.id && (
                                                    <div className="w-3 h-3 rounded-full bg-[#06A2E2]" />
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {selectedMethod === "bank" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank <span className="text-red-500">*</span></label>
                                    <select
                                        name="bank"
                                        value={formData.bank}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 sm:p-2 border rounded-md focus:ring-[#06A2E2] focus:border-[#06A2E2] ${errors.bank ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select your bank</option>
                                        <option value="access">Access Bank</option>
                                        <option value="gtb">GTBank</option>
                                        <option value="zenith">Zenith Bank</option>
                                    </select>
                                    {errors.bank && (
                                        <p className="text-red-500 text-xs mt-1">{errors.bank}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 sm:p-2 border rounded-md focus:ring-[#06A2E2] focus:border-[#06A2E2] ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                                        maxLength={10}
                                        placeholder="10-digit account number"
                                    />
                                    {errors.accountNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="sortCode"
                                        value={formData.sortCode}
                                        onChange={handleInputChange}
                                        className={`w-full p-3 sm:p-2 border rounded-md focus:ring-[#06A2E2] focus:border-[#06A2E2] ${errors.sortCode ? 'border-red-500' : 'border-gray-300'}`}
                                        maxLength={6}
                                        placeholder="6-digit sort code"
                                    />
                                    {errors.sortCode && (
                                        <p className="text-red-500 text-xs mt-1">{errors.sortCode}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="acceptedTerms"
                                    checked={formData.acceptedTerms}
                                    onChange={handleInputChange}
                                    className={`rounded border-gray-300 text-[#06A2E2] focus:ring-[#06A2E2] ${errors.acceptedTerms ? 'border-red-500' : ''}`}
                                />
                                <span className="text-sm text-gray-600">
                                    I accept the terms and policies of woothomes payouts <span className="text-red-500">*</span>
                                </span>
                            </label>
                            {errors.acceptedTerms && (
                                <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms}</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                            <PrimaryButton
                                onClick={() => console.log("Saving progress...")}
                                variant="secondary"
                            >
                                Save and Exit
                            </PrimaryButton>

                            <PrimaryButton
                                type="submit"
                                variant="primary"
                            >
                                Submit
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};