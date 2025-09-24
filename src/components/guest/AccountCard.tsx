import Link from 'next/link';
import { ReactNode } from 'react';

interface AccountCardProps {
  href?: string;
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function AccountCard({
  href,
  icon,
  title,
  description,
  onClick,
}: AccountCardProps) {
  const content = (
    <div
      className="block cursor-pointer bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="text-blue-500 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );

  if (href && !onClick) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}