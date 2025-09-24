export interface AuthFormProps {
  formHeader: string;
  formSubtitle: string;
  formType: "signin" | "signup";
  formInputs: React.ReactNode[];
  onSubmit: () => void;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role?: string;
  accept_terms: boolean;
  recaptchaToken?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  recaptchaToken?: string;
}
