import { ReactNode } from 'react';

interface ServicesLayoutProps {
  children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E3A8A]/5 to-white">
      <div className="max-w-7xl mx-auto p-3">
        {children}
      </div>
    </div>
  );
} 