"use client";

import { useState } from "react";
import { Input } from "@woothomes/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { usePropertyStore } from "@woothomes/store/usePropertyStore";
import { PrimaryButton } from "../ui/primaryButton";
// import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";

interface PropertyPricingFormProps {
    onNext: () => void;
    onBack: () => void;
    onSaveAndExit: () => void;
    isLoading?: boolean;
}

export const PropertyPricingForm = ({ onNext, onBack, onSaveAndExit, isLoading }: PropertyPricingFormProps) => {
    const { propertyData, setPropertyData } = usePropertyStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch rental types to map id to slug
    const { data: rentalTypesData } = useQuery({
        queryKey: ["propertyRentalTypes"],
        queryFn: async () => {
            const response = await axiosBase.get("/properties/rental-types");
            return response.data;
        },
    });

    // Fetch rules for multi-select
    const { data: rulesData } = useQuery({
        queryKey: ["rules"],
        queryFn: async () => {
            const response = await axiosBase.get("/rules");
            return response.data;
        },
    });
    console.log({rulesData})
    // Find the selected rental type slug
    const selectedRentalType = rentalTypesData?.data?.find((type: { id: string; slug: string }) => type.id === propertyData.rental_type_id);
    const isHourly = selectedRentalType?.slug === "hourly";

    const handleInputChange = (field: keyof typeof propertyData, value: number | string | string[]) => {
        setPropertyData({ [field]: value });

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (isHourly) {
            if (!propertyData.price_per_hour || propertyData.price_per_hour <= 0) {
                newErrors.price_per_hour = "Price per hour is required and must be greater than 0";
            }
            if (!propertyData.minimum_hours || propertyData.minimum_hours <= 0) {
                newErrors.minimum_hours = "Minimum hours is required and must be greater than 0";
            }
            if (!propertyData.hourly_start_time) {
                newErrors.hourly_start_time = "Start time is required";
            }
            if (!propertyData.hourly_end_time) {
                newErrors.hourly_end_time = "End time is required";
            }
        } else {
            if (!propertyData.price_per_night || propertyData.price_per_night <= 0) {
                newErrors.price_per_night = "Price per night is required and must be greater than 0";
            }
        }

        // if (!propertyData.house_rules || propertyData.house_rules.length === 0) {
        //     newErrors.house_rules = "At least one house rule is required";
        // }

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">List Your First Property</h1>
                    <p className="text-gray-600">List and manage your property, you can publish when ever your ready</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="text-right mb-4">
                        <span className="text-blue-500">Step 3 of 4</span>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {isHourly ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price Per Hour <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2">₦</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={propertyData.price_per_hour || ''}
                                                onChange={(e) => handleInputChange("price_per_hour", parseFloat(e.target.value))}
                                                className={`pl-8 ${errors.price_per_hour ? 'border-red-500' : ''}`}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {errors.price_per_hour && (
                                            <p className="text-red-500 text-xs mt-1">{errors.price_per_hour}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Minimum Hours <span className="text-red-500">*</span></label>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            value={propertyData.minimum_hours || ''}
                                            onChange={(e) => handleInputChange("minimum_hours", parseInt(e.target.value))}
                                            className={errors.minimum_hours ? 'border-red-500' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.minimum_hours && (
                                            <p className="text-red-500 text-xs mt-1">{errors.minimum_hours}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Time <span className="text-red-500">*</span></label>
                                        <Input
                                            type="time"
                                            value={propertyData.hourly_start_time || ''}
                                            onChange={(e) => handleInputChange("hourly_start_time", e.target.value)}
                                            className={errors.hourly_start_time ? 'border-red-500' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.hourly_start_time && (
                                            <p className="text-red-500 text-xs mt-1">{errors.hourly_start_time}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Time <span className="text-red-500">*</span></label>
                                        <Input
                                            type="time"
                                            value={propertyData.hourly_end_time || ''}
                                            onChange={(e) => handleInputChange("hourly_end_time", e.target.value)}
                                            className={errors.hourly_end_time ? 'border-red-500' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.hourly_end_time && (
                                            <p className="text-red-500 text-xs mt-1">{errors.hourly_end_time}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price Per Night <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2">₦</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={propertyData.price_per_night || ''}
                                            onChange={(e) => handleInputChange("price_per_night", parseFloat(e.target.value))}
                                            className={`pl-8 ${errors.price_per_night ? 'border-red-500' : ''}`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.price_per_night && (
                                        <p className="text-red-500 text-xs mt-1">{errors.price_per_night}</p>
                                    )}
                                </div>
                            )}
                            {/* <div>
                                <label className="block text-sm font-medium mb-2">House Rules <span className="text-red-500">*</span></label>
                                <Textarea
                                    placeholder="Enter house rules (one per line)..."
                                    value={propertyData.house_rules?.join('\n') || ''}
                                    onChange={(e) => handleInputChange("house_rules", e.target.value.split('\n').filter(Boolean))}
                                    className={`min-h-[100px] ${errors.house_rules ? 'border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.house_rules && (
                                    <p className="text-red-500 text-xs mt-1">{errors.house_rules}</p>
                                )}
                            </div> */}
                        </div>
                        {/* Rules Multi-Select */}
                        {rulesData && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Property Rules</label>
                                {Object.entries(rulesData.data.rules).map(([category, rules]) => (
                                    <div key={category} className="mb-2">
                                        <div className="font-semibold capitalize mb-1">{category.replace(/_/g, ' ')}</div>
                                        {(rules as { id: string; name: string; description: string; is_required?: boolean }[]).map((rule) => {
                                            const isChecked = rule.is_required || propertyData.rules?.includes(rule.id);
                                            return (
                                                <label key={rule.id} className="flex items-center gap-2 mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={e => {
                                                            if (rule.is_required) return; // Prevent unchecking required rules
                                                            const checked = e.target.checked;
                                                            setPropertyData({
                                                                rules: checked
                                                                    ? Array.from(new Set([...(propertyData.rules || []), rule.id]))
                                                                    : (propertyData.rules || []).filter((id: string) => id !== rule.id),
                                                            });
                                                        }}
                                                        disabled={rule.is_required}
                                                    />
                                                    <span>{rule.name}</span>
                                                    <span className="text-xs text-gray-400">{rule.description}</span>
                                                    {rule.is_required && <span className="text-xs text-red-500 ml-2">(Required)</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
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
    );
};