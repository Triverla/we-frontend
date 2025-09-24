import { FieldError } from "react-hook-form";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  type: "text" | "email" | "password" | "number" | "textarea";
  placeholder: string;
  error?: FieldError;
  isCalendar?: boolean;
  rows?: number;
}
