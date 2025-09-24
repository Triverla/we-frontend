export interface ButtonProps {
  type: "submit" | "button";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean | undefined;
}
