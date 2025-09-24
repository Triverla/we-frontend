import { z } from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const CheckPropertyAvailabilitySchema = z
  .object({
    check_in_date: z
      .date({
        required_error: "Check-in date is required",
        invalid_type_error: "Invalid check-in date",
      })
      .min(today, { message: "Check-in date cannot be in the past" }),

    check_out_date: z
      .date({
        required_error: "Check-out date is required",
        invalid_type_error: "Invalid check-out date",
      })
      .min(today, { message: "Check-out date cannot be in the past" }),

    guests_count: z
      .number()
      .min(1, { message: "At least one guest is required" }),

    total_price: z.number().min(1000),
  })
  .refine((data) => data.check_out_date > data.check_in_date, {
    path: ["check_out_date"],
    message: "Check-out date must be after check-in date",
  });

export const PropertyOfferSchema = z.object({
  property_id: z.string().min(1, { message: "Property ID is required" }),

  proposed_price: z
    .number({
      required_error: "Offer price is required",
      invalid_type_error: "Offer price must be a number",
    })
    .min(1000, { message: "Offer price must be at least ₦1000" }),

  message: z
    .string()
    .max(1000, { message: "Message must be under 1000 characters" })
    .optional(),

  expires_at: z
    .date({
      required_error: "Expiration date is required",
      invalid_type_error: "Invalid expiration date",
    })
    .min(today, { message: "Expiration date cannot be in the past" }),
});
