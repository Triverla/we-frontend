"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProperty, useUpdateProperty, useDeletePropertyImage, useSetPrimaryImage, useReorderImages } from "@woothomes/hooks/useProperties";
import { usePropertyStore } from "@woothomes/store/usePropertyStore";
import { toast } from "sonner";
import { LoadingSpinner, ButtonSpinner } from "@woothomes/components";
import Image from "next/image";
import { PrimaryButton } from "@woothomes/components/ui/primaryButton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@woothomes/components/ui/carousel";
import { Input } from "@woothomes/components/ui/input";
import { Textarea } from "@woothomes/components/ui/textarea";
import { X, Star, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Switch } from "@woothomes/components/ui/switch";
import { axiosBase } from "@woothomes/lib/axiosBase";
import { AxiosProgressEvent, AxiosError } from "axios";
import { Checkbox } from "@woothomes/components/ui/checkbox";
import axios from "axios";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@woothomes/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useImageValidator } from "@woothomes/hooks/useImageValidator";

interface PropertyImage {
    id: string;
    image_url: string;
    is_primary: boolean;
    tag: string;
}

interface PropertySettings {
    minimum_offer_percentage: number;
    maximum_offer_percentage: number;
    auto_accept_offers: boolean;
    require_guest_verification: boolean;
    minimum_stay_nights: number;
    maximum_stay_nights: number;
    advance_notice_hours: number;
    offer_expiration_hours: number;
}

interface Amenity {
    id: string;
    name: string;
    icon: string;
    category: string;
    description?: string;
}

interface Rule {
    id: string;
    name: string;
    description: string;
    category: string;
    is_required: boolean;
}

export default function PropertyUpdatePage() {
    const params = useParams();
    const router = useRouter();
       const { validateImageBeforeUpload } = useImageValidator();
    const propertyId = params.id as string;
    const { data: property, isLoading, isError } = useProperty(propertyId);
    const { setPropertyData, propertyData, reset, photos, setPhotos } = usePropertyStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const updatePropertyMutation = useUpdateProperty();
    const [dragActive, setDragActive] = useState(false);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const deleteImageMutation = useDeletePropertyImage();
    const setPrimaryImageMutation = useSetPrimaryImage();
    const reorderImagesMutation = useReorderImages();
    const [isUploading, setIsUploading] = useState(false);
    const [settings, setSettings] = useState<PropertySettings>({
        minimum_offer_percentage: 70,
        maximum_offer_percentage: 150,
        auto_accept_offers: false,
        require_guest_verification: true,
        minimum_stay_nights: 1,
        maximum_stay_nights: 30,
        advance_notice_hours: 24,
        offer_expiration_hours: 24
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [loadingRules, setLoadingRules] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedRules, setSelectedRules] = useState<string[]>([]);

    console.log({ theproperty: property })

    useEffect(() => {
        reset();
        setIsInitialized(false);
    }, [reset]);

    useEffect(() => {
        if (property && !isInitialized) {
            setPropertyData({
                title: property.title,
                description: property.description,
                property_type_id: property.property_type || "",
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                max_guests: property.guests,
                price_per_night: property.price_per_night,
                price_per_hour: property.price_per_hour,
                address: property.address,
                city: property.city,
                state: property.state,
                country: property.country,
                zip_code: property.zip_code,
                latitude: parseFloat(property.latitude) || 0,
                longitude: parseFloat(property.longitude) || 0,
                amenities: property.amenities.map(amenity =>
                    typeof amenity === 'object' ? amenity.id : amenity
                ),
                rules: typeof property.rules === 'string' ? property.rules.split(',').map(rule => rule.trim()) : [],
            });
            setIsInitialized(true);
        }
    }, [property, setPropertyData, isInitialized]);

    // Fetch amenities and rules
    useEffect(() => {
        const fetchAmenitiesAndRules = async () => {
            try {
                const [amenitiesRes, rulesRes] = await Promise.all([
                    axiosBase.get('/amenities'),
                    axiosBase.get('/rules')
                ]);
                
                const amenitiesData: Amenity[] = Array.isArray(amenitiesRes.data?.data) 
                    ? amenitiesRes.data.data 
                    : Array.isArray(amenitiesRes.data) 
                        ? amenitiesRes.data 
                        : [];
                
                const rulesData = (rulesRes.data?.data?.rules 
                    ? Object.values(rulesRes.data.data.rules).flat()
                    : []) as Rule[];

                if (property?.rules && !propertyData.rules) {
                    setPropertyData({
                        ...propertyData,
                        rules: Array.isArray(property.rules) ? property.rules : [property.rules]
                    });
                }
                
                setAmenities(amenitiesData);
                setRules(rulesData);
            } catch (error) {
                console.error('Error fetching amenities and rules:', error);
                if (axios.isAxiosError(error)) {
                    console.error('API Error Details:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message
                    });
                }
                toast.error('Failed to load amenities and rules');
                setAmenities([]);
                setRules([]);
            } finally {
                setLoadingAmenities(false);
                setLoadingRules(false);
            }
        };

        fetchAmenitiesAndRules();
    }, [property, propertyData, setPropertyData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPropertyData({ [name]: value });
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = Number(value);

        // For price fields, store the original price (input value * 1.25 to get original)
        if (name === 'price_per_night' || name === 'price_per_hour') {
            const originalPrice = Math.round(numValue * 1.25); // Convert reduced price back to original
            setPropertyData({ [name]: originalPrice });
        } else {
            setPropertyData({ [name]: numValue });
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            setNewPhotos(prev => [...prev, ...imageFiles]);
            setPhotos([...photos, ...imageFiles]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const filesArray = Array.from(files);
            setNewPhotos(prev => [...prev, ...filesArray]);
            setPhotos([...photos, ...filesArray]);
        }
    };

    const handleRemovePhoto = (index: number) => {
        const updatedPhotos = [...newPhotos];
        updatedPhotos.splice(index, 1);
        setNewPhotos(updatedPhotos);

        const updatedStorePhotos = [...photos];
        updatedStorePhotos.splice(index, 1);
        setPhotos(updatedStorePhotos);
    };

const handleUploadImages = async () => {
  if (newPhotos.length === 0) {
    toast.error("Please select images to upload");
    return;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  const fileErrors: string[] = [];

  for (const file of newPhotos) {
    const isImage = file.type.startsWith('image/');
    const isSizeValid = file.size <= maxSize;

    if (!isImage) {
      fileErrors.push(`${file.name}: Not an image file.`);
      continue;
    }

    if (!isSizeValid) {
      fileErrors.push(`${file.name}: Exceeds 10MB size limit.`);
      continue;
    }

    const result = await validateImageBeforeUpload(file);
    if (!result.isValid && result.reason) {
      fileErrors.push(result.reason);
    }
  }

  if (fileErrors.length > 0) {
    toast.error(
      `Some images failed validation:\n\n${fileErrors.join('\n')}`,
      { duration: 7000 }
    );
    return;
  }

  // All images valid — proceed with upload
  setIsUploading(true);
  try {
    const formData = new FormData();
    newPhotos.forEach((photo) => {
      formData.append("images[]", photo);
      formData.append("tags[]", "other");
    });

    const response = await axiosBase.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const total = progressEvent.total ?? 0;
        if (total > 0) {
          const progress = Math.round((progressEvent.loaded * 100) / total);
          toast.loading(`Uploading images: ${progress}%`, {
            id: 'upload-progress',
          });
        }
      },
    });

    if (response.data.failed_uploads?.length > 0) {
      toast.warning("Some images failed to upload. Please try again.");
      console.error("Failed uploads:", response.data.failed_uploads);
    } else {
      toast.success("Images uploaded successfully!");
      setNewPhotos([]);
      setPhotos([]);
    }
  } catch (error: unknown) {
    console.error("Error uploading images:", error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to upload images. Please try again.");
    }
  } finally {
    setIsUploading(false);
    toast.dismiss('upload-progress');
  }
};


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Update property data
            await updatePropertyMutation.mutateAsync({
                id: propertyId,
                data: {
                    ...propertyData,
                    latitude: propertyData.latitude.toString(),
                    longitude: propertyData.longitude.toString(),
                    rules: propertyData.rules?.join(',') || undefined,
                },
            });

            toast.success("Property updated successfully!");
            router.push("/host/listings");
        } catch (error) {
            console.error("Error updating property:", error);
            toast.error("Failed to update property. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        try {
            await deleteImageMutation.mutateAsync({ propertyId, imageId });
            toast.success("Image deleted successfully");
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Failed to delete image");
        }
    };

    const handleSetPrimaryImage = async (imageId: string) => {
        try {
            await setPrimaryImageMutation.mutateAsync({ propertyId, imageId });
            toast.success("Primary image updated");
        } catch (error) {
            console.error("Error setting primary image:", error);
            toast.error("Failed to set primary image");
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(images);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        try {
            await reorderImagesMutation.mutateAsync({
                propertyId,
                imageIds: items.map(img => typeof img === 'object' ? img.id : img)
            });
            toast.success("Images reordered successfully");
        } catch (error) {
            console.error("Error reordering images:", error);
            toast.error("Failed to reorder images");
        }
    };

    const handleSettingsChange = (name: keyof PropertySettings, value: string | boolean | number) => {
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            // Update property settings
            await updatePropertyMutation.mutateAsync({
                id: propertyId,
                data: {
                    ...propertyData,
                    latitude: propertyData.latitude.toString(),
                    longitude: propertyData.longitude.toString(),
                    rules: propertyData.rules?.join(',') || undefined,
                    property_settings: settings
                }
            });
            toast.success("Property settings updated successfully!");
        } catch (error) {
            console.error("Error updating property settings:", error);
            toast.error("Failed to update property settings. Please try again.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleAmenityChange = (amenityId: string, checked: boolean) => {
        const newAmenities = checked
            ? [...(propertyData.amenities || []), amenityId]
            : (propertyData.amenities || []).filter((id: string) => id !== amenityId);
        setPropertyData({ ...propertyData, amenities: newAmenities });
    };

    const handleUpdate = async () => {
        if (!property) return;
        
        try {
            setIsSaving(true);
            const response = await axiosBase.put(`/properties/${property.id}`, {
                ...propertyData,
                amenities: propertyData.amenities || [],
                rules: propertyData.rules || []
            });
            
            if (response.data.success) {
                toast.success('Property updated successfully');
                setPropertyData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to update property');
            }
        } catch (error) {
            console.error('Error updating property:', error);
            toast.error('Failed to update property');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (isError || !property) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Error loading property. Please try again.</div>
            </div>
        );
    }

    // Use default image if no images are available
    const images: PropertyImage[] =
        property.images && property.images.length > 0
            ? property.images.map(
                (img) =>
                    typeof img === "object" && "image_url" in img
                        ? img as PropertyImage
                        : { id: Math.random().toString(), image_url: img as string, is_primary: false, tag: 'other' }
            )
            : [{ id: 'default', image_url: "/home/home.jpeg", is_primary: true, tag: 'other' }];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">Property Images</h2>

                                    <div className="mb-6">
                                        <Carousel className="w-full">
                                            <CarouselContent>
                                                {images.map((image, index) => (
                                                    <CarouselItem key={index}>
                                                        <div className="relative h-64 w-full rounded-lg overflow-hidden group">
                                                            <Image
                                                                src={image.image_url}
                                                                alt={`Property image ${index + 1}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteImage(image.id)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                                >
                                                                    <X size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="left-2" type="button" />
                                            <CarouselNext className="right-2" type="button" />
                                        </Carousel>
                                    </div>

                                    {/* Image Grid with Drag and Drop */}
                                    <div className="mb-6">
                                        <h3 className="text-md font-medium mb-2">Manage Images</h3>
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <Droppable droppableId="images" direction="horizontal">
                                                {(provided) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="grid grid-cols-3 gap-2"
                                                    >
                                                        {images.map((image, index) => (
                                                            <Draggable
                                                                key={image.id}
                                                                draggableId={image.id}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        className="relative group"
                                                                    >
                                                                        <div className="h-24 w-full relative rounded overflow-hidden">
                                                                            <Image
                                                                                src={image.image_url}
                                                                                alt={`Property image ${index + 1}`}
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                                                                <div className="flex gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleSetPrimaryImage(image.id)}
                                                                                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${
                                                                                            image.is_primary ? 'bg-yellow-500' : 'bg-gray-500'
                                                                                        }`}
                                                                                    >
                                                                                        <Star size={16} className="text-white" />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteImage(image.id)}
                                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full"
                                                                                    >
                                                                                        <X size={16} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className="absolute top-1 left-1 bg-white/50 rounded-full p-1 cursor-move"
                                                                        >
                                                                            <GripVertical size={16} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </div>

                                    {/* Upload new images */}
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-4 text-center ${
                                            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileInput}
                                        />
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            <button
                                                type="button"
                                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? 'Uploading...' : 'Select Files'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview of new images */}
                                    {newPhotos.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="text-md font-medium mb-2">New Images to Upload:</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {newPhotos.map((photo, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="h-24 w-full relative rounded overflow-hidden">
                                                            <Image
                                                                src={URL.createObjectURL(photo)}
                                                                alt={`New photo ${index + 1}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePhoto(index)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1"
                                                                    disabled={isUploading}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {photo.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                <PrimaryButton
                                                    type="button"
                                                    onClick={handleUploadImages}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? <ButtonSpinner /> : "Upload Images"}
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right column - Property details */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">Property Details</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                                Title
                                            </label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={propertyData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={propertyData.description}
                                                onChange={handleInputChange}
                                                rows={4}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price Per Night (₦)
                                                </label>
                                                <Input
                                                    id="price_per_night"
                                                    name="price_per_night"
                                                    type="number"
                                                    value={propertyData.price_per_night ? Math.round(propertyData.price_per_night * 0.8) : ''}
                                                    onChange={handleNumberInputChange}
                                                    min="0"
                                                    required
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {propertyData.price_per_night ? (
                                                        <>
                                                    Guests will pay: ₦{propertyData.price_per_night.toLocaleString()}
                                                            <br />
                                                            <span className="text-xs">(20% discount applied)</span>
                                                        </>
                                                    ) : (
                                                        'Enter a price per night'
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <label htmlFor="price_per_hour" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price Per Hour (₦)
                                                </label>
                                                <Input
                                                    id="price_per_hour"
                                                    name="price_per_hour"
                                                    type="number"
                                                    value={propertyData.price_per_hour ? Math.round(propertyData.price_per_hour * 0.8) : ''}
                                                    onChange={handleNumberInputChange}
                                                    min="0"
                                                />
                                                    <p className="text-sm text-gray-500 mt-1">
                                                    {propertyData.price_per_hour ? (
                                                        <>
                                                        Guests will pay: ₦{propertyData.price_per_hour.toLocaleString()}
                                                            <br />
                                                            <span className="text-xs">(20% fees applied)</span>
                                                        </>
                                                    ) : (
                                                        'Optional: Enter a price per hour for hourly rentals'
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rental Type Selection */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rental Type
                                            </label>
                                            <div className="flex gap-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rental_type"
                                                        value="daily"
                                                        checked={!propertyData.price_per_hour}
                                                        onChange={() => {
                                                            setPropertyData({
                                                                ...propertyData,
                                                                price_per_hour: undefined
                                                            });
                                                        }}
                                                        className="form-radio h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Daily Rental</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rental_type"
                                                        value="hourly"
                                                        checked={!!propertyData.price_per_hour}
                                                        onChange={() => {
                                                            if (!propertyData.price_per_hour) {
                                                                setPropertyData({
                                                                    ...propertyData,
                                                                    price_per_hour: Math.round(propertyData.price_per_night / 24)
                                                                });
                                                            }
                                                        }}
                                                        className="form-radio h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">Hourly Rental</span>
                                                </label>
                                            </div>
                                            {propertyData.price_per_hour && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Hourly rate is automatically calculated as 1/24th of the daily rate.
                                                    You can adjust it manually if needed.
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bedrooms
                                                </label>
                                                <Input
                                                    id="bedrooms"
                                                    name="bedrooms"
                                                    type="number"
                                                    value={propertyData.bedrooms}
                                                    onChange={handleNumberInputChange}
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bathrooms
                                                </label>
                                                <Input
                                                    id="bathrooms"
                                                    name="bathrooms"
                                                    type="number"
                                                    value={propertyData.bathrooms}
                                                    onChange={handleNumberInputChange}
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="max_guests" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Max Guests
                                                </label>
                                                <Input
                                                    id="max_guests"
                                                    name="max_guests"
                                                    type="number"
                                                    value={propertyData.max_guests}
                                                    onChange={handleNumberInputChange}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                                Address
                                            </label>
                                            <Input
                                                id="address"
                                                name="address"
                                                value={propertyData.address}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                                    City
                                                </label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={propertyData.city}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                                    State
                                                </label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    value={propertyData.state}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Country
                                                </label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    value={propertyData.country}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Zip Code
                                                </label>
                                                <Input
                                                    id="zip_code"
                                                    name="zip_code"
                                                    value={propertyData.zip_code}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-4">
                                <PrimaryButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push("/host/listings")}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </PrimaryButton>

                                <PrimaryButton
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ButtonSpinner /> : "Update Property"}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Property Details Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Amenities Section */}
                            <div className="border rounded-lg">
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                                            <h3 className="text-md font-medium">Amenities</h3>
                                            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent asChild>
                                        <div className="p-4 pt-0">
                                            {loadingAmenities ? (
                                                <div className="flex justify-center py-4">
                                                    <ButtonSpinner />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {amenities.map((amenity) => (
                                                        <div
                                                            key={amenity.id}
                                                            className={`flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                                                                propertyData.amenities?.includes(amenity.id) ? 'bg-blue-50 border-blue-200' : ''
                                                            }`}
                                                            onClick={() => handleAmenityChange(amenity.id, !propertyData.amenities?.includes(amenity.id))}
                                                        >
                                                            <Checkbox
                                                                id={`amenity-${amenity.id}`}
                                                                checked={propertyData.amenities?.includes(amenity.id)}
                                                                onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                                                            />
                                                            <div className="space-y-1">
                                                                <span className="text-sm font-medium text-gray-700 cursor-pointer">
                                                                    {amenity.name}
                                                                </span>
                                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                                    {amenity.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>

                            {/* Property Rules Section */}
                            <div className="border rounded-lg">
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                                            <h3 className="text-md font-medium">Property Rules</h3>
                                            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent asChild>
                                        <div className="p-4 pt-0">
                                            {loadingRules ? (
                                                <div className="flex justify-center py-4">
                                                    <ButtonSpinner />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {rules.map((rule) => (
                                                        <div
                                                            key={rule.id}
                                                            className={`flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                                                                (rule.is_required || selectedRules.includes(rule.id)) ? 'bg-blue-50 border-blue-200' : ''
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                id={`rule-${rule.id}`}
                                                                checked={rule.is_required || selectedRules.includes(rule.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (!rule.is_required) {
                                                                        if (checked) {
                                                                            setSelectedRules(prev => [...prev, rule.id]);
                                                                        } else {
                                                                            setSelectedRules(prev => prev.filter(id => id !== rule.id));
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={rule.is_required}
                                                                className={rule.is_required ? "opacity-50 cursor-not-allowed" : ""}
                                                            />
                                                            <div className="space-y-1">
                                                                <span className="text-sm font-medium text-gray-700 cursor-pointer">
                                                                    {rule.name}
                                                                    {rule.is_required && (
                                                                        <span className="ml-2 text-xs text-red-500">(Required)</span>
                                                                    )}
                                                                </span>
                                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                                    {rule.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>

                            {/* Update Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleUpdate}
                                    disabled={isSaving}
                                    className="bg-[#06A2E2] hover:bg-[#1E3A8A] text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <ButtonSpinner />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Property Settings Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                                    <h2 className="text-lg font-semibold">Property Settings</h2>
                                    <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent asChild>
                                <div className="p-4 pt-0">
                        <div className="space-y-6">
                            {/* Offer Settings */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium">Offer Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Minimum Discount</span>
                                        <Input
                                            id="minimum_offer_percentage"
                                            type="number"
                                            value={settings.minimum_offer_percentage}
                                            onChange={(e) => handleSettingsChange('minimum_offer_percentage', parseFloat(e.target.value))}
                                            min="0"
                                            max="100"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Lowest price guests can offer (e.g., 70 = 30% off)</p>
                                    </div>
                                    <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Maximum Increase</span>
                                        <Input
                                            id="maximum_offer_percentage"
                                            type="number"
                                            value={settings.maximum_offer_percentage}
                                            onChange={(e) => handleSettingsChange('maximum_offer_percentage', parseFloat(e.target.value))}
                                            min="100"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Highest price guests can offer (e.g., 150 = 50% more)</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={settings.auto_accept_offers}
                                        onCheckedChange={(checked) => handleSettingsChange('auto_accept_offers', checked)}
                                    />
                                                <span className="text-sm text-gray-700">Automatically accept offers within price range</span>
                                </div>
                            </div>

                            {/* Stay Settings */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium">Stay Duration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Minimum Stay</span>
                                        <Input
                                            id="minimum_stay_nights"
                                            type="number"
                                            value={settings.minimum_stay_nights}
                                            onChange={(e) => handleSettingsChange('minimum_stay_nights', parseInt(e.target.value))}
                                            min="1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Shortest allowed stay in nights</p>
                                    </div>
                                    <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Maximum Stay</span>
                                        <Input
                                            id="maximum_stay_nights"
                                            type="number"
                                            value={settings.maximum_stay_nights}
                                            onChange={(e) => handleSettingsChange('maximum_stay_nights', parseInt(e.target.value))}
                                            min="1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Longest allowed stay in nights</p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Settings */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium">Booking Requirements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Advance Booking Notice</span>
                                        <Input
                                            id="advance_notice_hours"
                                            type="number"
                                            value={settings.advance_notice_hours}
                                            onChange={(e) => handleSettingsChange('advance_notice_hours', parseInt(e.target.value))}
                                            min="0"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Minimum hours before check-in time</p>
                                    </div>
                                    <div>
                                                    <span className="block text-sm font-medium text-gray-700 mb-2">Offer Time Limit</span>
                                        <Input
                                            id="offer_expiration_hours"
                                            type="number"
                                            value={settings.offer_expiration_hours}
                                            onChange={(e) => handleSettingsChange('offer_expiration_hours', parseInt(e.target.value))}
                                            min="1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Hours before offer expires</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={settings.require_guest_verification}
                                        onCheckedChange={(checked) => handleSettingsChange('require_guest_verification', checked)}
                                    />
                                                <span className="text-sm text-gray-700">Require guest identity verification</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                            <button
                                    onClick={handleSaveSettings}
                                    disabled={isSavingSettings}
                                                className="bg-[#06A2E2] hover:bg-[#1E3A8A] text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                            >
                                                {isSavingSettings ? (
                                                    <>
                                                        <ButtonSpinner />
                                                        <span>Saving...</span>
                                                    </>
                                                ) : (
                                                    <span>Save Settings</span>
                                                )}
                                            </button>
                            </div>
                        </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </div>
        </div>
    );
}