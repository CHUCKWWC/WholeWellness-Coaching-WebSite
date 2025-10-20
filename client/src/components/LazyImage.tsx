import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

/**
 * Lazy Loading Image Component
 *
 * Features:
 * - Intersection Observer API for efficient lazy loading
 * - Placeholder/blur effect while loading
 * - Responsive image support
 * - Error handling with fallback
 * - Performance optimized
 */
export function LazyImage({
  src,
  alt,
  placeholderSrc,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the actual image
            const img = new Image();
            img.src = src;

            img.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
              if (onLoad) onLoad();
            };

            img.onerror = () => {
              setHasError(true);
              setIsLoading(false);
              if (onError) onError();
            };

            // Stop observing once loaded
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold, rootMargin, onLoad, onError]);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        {...props}
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoading ? 'opacity-50 blur-sm' : 'opacity-100',
        className
      )}
      loading="lazy"
      {...props}
    />
  );
}

/**
 * Responsive Lazy Image with srcset support
 */
interface ResponsiveLazyImageProps extends LazyImageProps {
  srcSet?: string;
  sizes?: string;
}

export function ResponsiveLazyImage({
  srcSet,
  sizes,
  ...props
}: ResponsiveLazyImageProps) {
  return (
    <LazyImage
      {...props}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
}

export default LazyImage;
