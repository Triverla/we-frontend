import React, { forwardRef, HTMLAttributes, ReactNode } from "react";

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-scroll ${className || ""}`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#E5E7EB transparent",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
