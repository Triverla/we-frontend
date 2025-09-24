"use client";

import { useState, useEffect } from "react";
import { Trash2, MapPin, Users, Bath, Star } from "lucide-react";
import {
  Carousel,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselContent,
  CarouselApi,
} from "@woothomes/components/ui/carousel";
import { formatPrice } from "@woothomes/lib";
import { PrimaryButton } from "@woothomes/components/ui/primaryButton";
import { Modal } from "@woothomes/components/ui/modal";
import Image from "next/image";
import { Skeleton } from "@woothomes/components/ui/skeleton";
import {
  useUnpublishProperty,
  usePublishProperty,
  ApiProperty,
} from "@woothomes/hooks/useProperties";
// import { toast } from "sonner";
import { ButtonSpinner } from "@woothomes/components/ui/spinner";

// Add this import at the top of the file
import { useRouter } from "next/navigation";

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[450px]">
      <div className="relative">
        <Skeleton className="h-40 w-full" />
        <div className="absolute top-5 -left-12">
          <Skeleton className="w-40 h-8 ml-10" />
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />

        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>

        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-40 mb-4" />

        <div className="mt-auto flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
};

export const PropertyCard = ({
  property,
  onDelete,
}: {
  property: ApiProperty;
  onDelete?: () => void;
}) => {
  // Add this line near the other useState declarations
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReconfirmModal, setShowReconfirmModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const unpublishPropertyMutation = useUnpublishProperty();
  const publishPropertyMutation = usePublishProperty();
  const [isDeleting, setIsDeleting] = useState(false);

  const isActive = property.status === "active";

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      }
      setShowConfirmDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete property");
      console.error("Error deleting property:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishPropertyMutation.mutateAsync(property.id);
      setShowReconfirmModal(false);
      // toast.success("Property unpublished successfully");
    } catch (error) {
      // co.error("Failed to unpublish property");
      console.error("Error unpublishing property:", error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishPropertyMutation.mutateAsync(property.id);
      setShowReconfirmModal(false);
      // toast.success("Property published successfully");
    } catch (error) {
      // toast.error("Failed to publish property");
      console.error("Error publishing property:", error);
    }
  };

  // Use default image if no images are available
  const images =
    property.images && property.images.length > 0
      ? property.images.map(
        (img) =>
          typeof img === "object" && "image_url" in img
            ? img
            : { image_url: img }
      )
      : [{ image_url: "/home/home.jpeg" }];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[450px]">
      <div className="relative group">
        <Carousel
          orientation="horizontal"
          opts={{ loop: false }}
          setApi={setApi}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="relative">
                <div className="h-40 w-full relative overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={`carousel-image-${index}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center"
                    priority={index === 0}
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                      <span
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-200 ${index === activeIndex ? "bg-[#06A2E2]" : "bg-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {activeIndex > 0 && (
            <CarouselPrevious className="hidden group-hover:flex cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 z-10" />
          )}
          {activeIndex < images.length - 1 && (
            <CarouselNext className="hidden group-hover:flex cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 z-10" />
          )}
        </Carousel>

        <div className="absolute top-5 -left-12 bg-white px-4 py-2 rounded-md font-bold text-sm shadow text-black">
          {property.price_per_hour && property.price_per_hour > 0 ? (
            <p className="ml-10">₦{formatPrice(property.price_per_hour)} Per Hour</p>
          ) : (
            <p className="ml-10">₦{formatPrice(property.price_per_night)} Per Night</p>
          )}
        </div>
        <div className="absolute top-5 right-3">
          <button
            onClick={() => setShowConfirmDeleteModal(true)}
            className="text-red-500 focus:outline-none"
          >
            <p className="p-1 rounded-full bg-white">
              <Trash2 className=" cursor-pointer" size={18} />
            </p>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-[#068CE2] font-bold text-base sm:text-lg mb-1 truncate">
          {property.title}
        </h3>
        <div className="flex items-center text-black font-semibold text-xs sm:text-sm mb-1 sm:mb-2">
          <MapPin size={14} className="mr-1 text-gray-500" />
          <span className="truncate">{property.address}</span>
        </div>

        <div className="flex justify-between text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
          <div className="flex items-center">
            <Users size={14} className="mr-1" />
            {property.bedrooms} beds
          </div>
          <div className="flex items-center">
            <Bath size={14} className="mr-1" />
            {property.bathrooms} Baths
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
            {property.rating} ({property.reviews} Reviews)
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="bg-[#F4F3FE] text-[#1E3A8A] text-xs font-medium px-2 py-0.5 rounded-lg"
            >
              {typeof amenity === "object" ? amenity.name : amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="bg-[#F4F3FE] text-[#1E3A8A] text-xs font-medium px-2 py-0.5 rounded-lg">
              +{property.amenities.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <PrimaryButton className="flex-1 py-1.5 sm:py-2 rounded-md font-medium text-xs sm:text-sm" onClick={() => router.push(`/host/properties/${property.id}`)}>
            View
          </PrimaryButton>
          <PrimaryButton
            onClick={() => setShowConfirmModal(true)}
            variant="secondary"
            className="flex-1 py-1.5 sm:py-2 rounded-md font-medium text-xs sm:text-sm"
          >
            {isActive ? "Unpublish" : "Publish"}
          </PrimaryButton>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        header={
          isActive
            ? "Are you sure you want to unpublish this property?"
            : "Are you sure you want to publish this property?"
        }
        message={
          isActive
            ? "Potential guests can no longer see it until you publish it again"
            : "This will make your property visible to potential guests"
        }
        buttons={[
          {
            label: isActive ? "Yes, unpublish" : "Yes, publish",
            onClick: () => {
              setShowConfirmModal(false);
              setShowReconfirmModal(true);
            },
            variant: "danger",
            disabled:
              unpublishPropertyMutation.isPending ||
              publishPropertyMutation.isPending,
          },
          {
            label: isActive ? "No, don't unpublish" : "No, don't publish",
            onClick: () => setShowConfirmModal(false),
            variant: "secondary",
            disabled:
              unpublishPropertyMutation.isPending ||
              publishPropertyMutation.isPending,
          },
        ]}
      />
      <Modal
        isOpen={showReconfirmModal}
        onClose={() => setShowReconfirmModal(false)}
        header={
          isActive
            ? "Are you sure you want to unpublish this property?"
            : "Are you sure you want to publish this property?"
        }
        message={
          isActive
            ? "Potential guests can no longer see it until you publish it again"
            : "This will make your property visible to potential guests"
        }
        buttons={[
          {
            label:
              unpublishPropertyMutation.isPending ||
                publishPropertyMutation.isPending ? (
                <ButtonSpinner />
              ) : (
                "OK"
              ),
            onClick: isActive ? handleUnpublish : handlePublish,
            variant: "danger",
            disabled:
              unpublishPropertyMutation.isPending ||
              publishPropertyMutation.isPending,
          },
        ]}
      />
      <Modal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        header="Are you sure you want to delete this property?"
        message="Once you delete it, its gone for good"
        buttons={[
          {
            label: isDeleting ? <ButtonSpinner /> : "Yes, delete",
            onClick: handleDelete,
            variant: "danger",
            disabled: isDeleting,
          },
          {
            label: "No, don't delete",
            onClick: () => setShowConfirmDeleteModal(false),
            variant: "secondary",
            disabled: isDeleting,
          },
        ]}
      />
    </div>
  );
};
