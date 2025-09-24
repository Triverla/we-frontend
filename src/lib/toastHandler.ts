import { toast } from "sonner";

interface ToastError {
  message?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export const showErrorToast = (error: ToastError) => {
  const { status, message, errors } = error;

  const statusMessages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "You are not authorized. Please log in.",
    403: "Access denied. You do not have permission.",
    404: "Requested resource was not found.",
    408: "Request timed out. Try again later.",
    422: "Validation failed. Please fix the highlighted fields.",
    500: "Something went wrong on the server.",
    503: "Service is currently unavailable. Try again later.",
  };

  const fallbackMessage = status
    ? statusMessages[status] || "An error occurred."
    : "An unexpected error occurred.";

  if (errors && typeof errors === "object") {
    Object.entries(errors).forEach(([field, messages]) => {
      toast.error(`${field}: ${messages.join(", ")}`);
    });
    return;
  }

  toast.error(message || fallbackMessage);
};

export const showSuccessToast = (
  message?: string,
  fallback = "Operation completed successfully."
) => {
  toast.success(message || fallback);
};
