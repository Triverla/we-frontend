import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty("Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().nonempty("Name is required"),
    email: z
      .string()
      .email("Please enter a valid email")
      .nonempty("Email is required"),
    phone: z.string().min(11).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long") // Updated to 8 characters
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // Added uppercase requirement
      .regex(/[a-z]/, "Password must contain at least one lowercase letter") // Added lowercase requirement
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      )
      .nonempty("Password is required"),
    password_confirmation: z.string().nonempty("Confirm Password is required"),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

export const signUpVerificationSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit code"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
