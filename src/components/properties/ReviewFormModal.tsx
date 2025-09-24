"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@woothomes/components/ui/dialog";
import { Button } from "@woothomes/components/ui/button";
import { Textarea } from "@woothomes/components/ui/textarea";
import { Star } from "lucide-react";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";

// Validation schema for the review form
const reviewSchema = z.object({
  rating: z.number().min(1, "Overall rating is required").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be less than 1000 characters"),
  cleanliness: z.number().min(1, "Cleanliness rating is required").max(5),
  accuracy: z.number().min(1, "Accuracy rating is required").max(5),
  communication: z.number().min(1, "Communication rating is required").max(5),
  location: z.number().min(1, "Location rating is required").max(5),
  check_in: z.number().min(1, "Check-in rating is required").max(5),
  value: z.number().min(1, "Value rating is required").max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  bookingId: string;
  propertyTitle?: string;
  onSuccess?: () => void;
  reviewType?: 'guest' | 'host';
}

// Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange, 
  label, 
  error 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
  label: string;
  error?: string;
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none transition-colors"
          >
            <Star
              size={24}
              className={`${
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export function ReviewFormModal({ 
  open, 
  onOpenChange, 
  propertyId, 
  bookingId, 
  propertyTitle,
  onSuccess,
  reviewType = 'guest'
}: ReviewFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      check_in: 0,
      value: 0,
      comment: "",
    },
  });

  const watchedValues = watch();

  const handleRatingChange = (field: keyof ReviewFormData, rating: number) => {
    setValue(field, rating);
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);
      
      const reviewData = {
        ...data,
        property_id: propertyId,
        booking_id: bookingId,
      };

      const endpoint = reviewType === 'host' 
        ? `/host/reviews` 
        : `/properties/${propertyId}/reviews`;
      
      await axiosBase.post(endpoint, reviewData);
      
      // toast.success("Review submitted successfully!");
      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to submit review. Please try again.";
      console.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Leave a Review
            </DialogTitle>
          </div>
          {propertyTitle && (
            <p className="text-sm text-gray-600">
              Reviewing: <span className="font-medium">{propertyTitle}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="border-b pb-4">
            <StarRating
              rating={watchedValues.rating}
              onRatingChange={(rating) => handleRatingChange("rating", rating)}
              label="Overall Rating"
              error={errors.rating?.message}
            />
          </div>

          {/* Detailed Ratings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StarRating
              rating={watchedValues.cleanliness}
              onRatingChange={(rating) => handleRatingChange("cleanliness", rating)}
              label="Cleanliness"
              error={errors.cleanliness?.message}
            />
            
            <StarRating
              rating={watchedValues.accuracy}
              onRatingChange={(rating) => handleRatingChange("accuracy", rating)}
              label="Accuracy"
              error={errors.accuracy?.message}
            />
            
            <StarRating
              rating={watchedValues.communication}
              onRatingChange={(rating) => handleRatingChange("communication", rating)}
              label="Communication"
              error={errors.communication?.message}
            />
            
            <StarRating
              rating={watchedValues.location}
              onRatingChange={(rating) => handleRatingChange("location", rating)}
              label="Location"
              error={errors.location?.message}
            />
            
            <StarRating
              rating={watchedValues.check_in}
              onRatingChange={(rating) => handleRatingChange("check_in", rating)}
              label="Check-in"
              error={errors.check_in?.message}
            />
            
            <StarRating
              rating={watchedValues.value}
              onRatingChange={(rating) => handleRatingChange("value", rating)}
              label="Value"
              error={errors.value?.message}
            />
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Your Review
            </label>
            <Textarea
              {...register("comment")}
              placeholder="Share your experience with this property..."
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {watchedValues.comment.length}/1000 characters
            </p>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 