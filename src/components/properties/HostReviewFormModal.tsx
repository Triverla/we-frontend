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

// Validation schema for the host review form
const hostReviewSchema = z.object({
  communication_rating: z.number().min(1, "Communication rating is required").max(5),
  cleanliness_rating: z.number().min(1, "Cleanliness rating is required").max(5),
  respect_rating: z.number().min(1, "Respect rating is required").max(5),
  overall_rating: z.number().min(1, "Overall rating is required").max(5),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
  private_comment: z.string().max(1000, "Private comment must be less than 1000 characters").optional(),
});

type HostReviewFormData = z.infer<typeof hostReviewSchema>;

interface HostReviewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  guestName?: string;
  propertyTitle?: string;
  onSuccess?: () => void;
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

export function HostReviewFormModal({ 
  open, 
  onOpenChange, 
  bookingId, 
  guestName,
  propertyTitle,
  onSuccess 
}: HostReviewFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<HostReviewFormData>({
    resolver: zodResolver(hostReviewSchema),
    defaultValues: {
      communication_rating: 0,
      cleanliness_rating: 0,
      respect_rating: 0,
      overall_rating: 0,
      comment: "",
      private_comment: "",
    },
  });

  const watchedValues = watch();

  const handleRatingChange = (field: keyof HostReviewFormData, rating: number) => {
    setValue(field, rating);
  };

  const onSubmit = async (data: HostReviewFormData) => {
    try {
      setIsSubmitting(true);
      
      const reviewData = {
        ...data,
        booking_id: bookingId,
        // Convert empty strings to null for optional fields
        comment: data.comment || null,
        private_comment: data.private_comment || null,
      };

      await axiosBase.post(`/host/reviews`, reviewData);
      
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
              Review Guest
            </DialogTitle>
          </div>
          {guestName && propertyTitle && (
            <p className="text-sm text-gray-600">
              Reviewing: <span className="font-medium">{guestName}</span> for <span className="font-medium">{propertyTitle}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div className="border-b pb-4">
            <StarRating
              rating={watchedValues.overall_rating}
              onRatingChange={(rating) => handleRatingChange("overall_rating", rating)}
              label="Overall Rating"
              error={errors.overall_rating?.message}
            />
          </div>

          {/* Detailed Ratings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarRating
              rating={watchedValues.communication_rating}
              onRatingChange={(rating) => handleRatingChange("communication_rating", rating)}
              label="Communication"
              error={errors.communication_rating?.message}
            />
            
            <StarRating
              rating={watchedValues.cleanliness_rating}
              onRatingChange={(rating) => handleRatingChange("cleanliness_rating", rating)}
              label="Cleanliness"
              error={errors.cleanliness_rating?.message}
            />
            
            <StarRating
              rating={watchedValues.respect_rating}
              onRatingChange={(rating) => handleRatingChange("respect_rating", rating)}
              label="Respect"
              error={errors.respect_rating?.message}
            />
          </div>

          {/* Public Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Public Review (Optional)
            </label>
            <Textarea
              {...register("comment")}
              placeholder="Share your experience with this guest (this will be visible to other hosts)..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {watchedValues.comment?.length || 0}/1000 characters
            </p>
          </div>

          {/* Private Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Private Notes (Optional)
            </label>
            <Textarea
              {...register("private_comment")}
              placeholder="Add private notes about this guest (only visible to you)..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            {errors.private_comment && (
              <p className="text-sm text-red-500">{errors.private_comment.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {watchedValues.private_comment?.length || 0}/1000 characters
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