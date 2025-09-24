'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@woothomes/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
  onClick?: () => void;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  onError,
  onClick,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Add a small delay before retrying
      setTimeout(() => {
        setError(false);
      }, 1000 * (retryCount + 1));
    } else {
      setError(true);
      onError?.();
    }
  };

  // Check if the image is from an external source
  const isExternalImage = src.startsWith('http://') || src.startsWith('https://');

  if (error) {
    return (
      <div
        className={cn(
          'bg-gray-100 flex items-center justify-center',
          className
        )}
        style={{ width, height }}
        onClick={onClick}
      >
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover', className)}
      priority={priority}
      quality={quality}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      sizes={`(max-width: ${width}px) 100vw, ${width}px`}
      onClick={onClick}
      unoptimized={isExternalImage}
    />
  );
} 