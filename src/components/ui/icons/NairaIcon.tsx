import React from 'react';

interface NairaIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const NairaIcon: React.FC<NairaIconProps> = ({
  className,
  size = 24,
  stroke = "currentColor",
  strokeWidth = 2,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Left vertical line */}
      <path d="M6 4v16" />
      {/* Right vertical line */}
      <path d="M18 4v16" />
      {/* Top horizontal line */}
      <path d="M4 9h16" />
      {/* Bottom horizontal line */}
      <path d="M4 15h16" />
      {/* Diagonal line */}
      <path d="M6 4l12 16" />
    </svg>
  );
};

export default NairaIcon; 