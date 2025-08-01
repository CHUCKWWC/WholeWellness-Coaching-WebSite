import { useState, useRef, useEffect } from 'react';
import { IntersectionLazyLoad } from './LazyLoadWrapper';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
}

// Optimized image component with lazy loading and performance features
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder,
  blurDataURL,
  sizes,
  quality = 85
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('attached_assets')) return baseSrc;
    
    // For uploaded assets, create different sizes if possible
    const sizes = [320, 640, 768, 1024, 1280];
    return sizes.map(size => `${baseSrc}?w=${size} ${size}w`).join(', ');
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  const imageElement = (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {(!isLoaded && !isError) && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{ 
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {placeholder && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              {placeholder}
            </div>
          )}
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        srcSet={generateSrcSet(src)}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${isError ? 'hidden' : ''}
        `}
        style={{
          contentVisibility: priority ? 'visible' : 'auto',
          containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
        }}
      />
    </div>
  );

  // Use intersection observer for non-priority images
  if (!priority) {
    return (
      <IntersectionLazyLoad>
        {imageElement}
      </IntersectionLazyLoad>
    );
  }

  return imageElement;
}

// Avatar component with optimized image loading
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = '',
  fallback
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [isError, setIsError] = useState(!src);

  if (isError || !src) {
    return (
      <div 
        className={`
          inline-flex items-center justify-center bg-gray-300 dark:bg-gray-600 
          text-gray-600 dark:text-gray-300 rounded-full ${className}
        `}
        style={{ width: size, height: size }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority={false}
      placeholder={alt.charAt(0).toUpperCase()}
    />
  );
}

// Gallery component with optimized loading
export function OptimizedGallery({
  images,
  columns = 3,
  gap = 4
}: {
  images: Array<{ src: string; alt: string; caption?: string }>;
  columns?: number;
  gap?: number;
}) {
  return (
    <div 
      className={`grid gap-${gap}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {images.map((image, index) => (
        <div key={index} className="group">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            priority={index < 3} // Prioritize first 3 images
            className="aspect-square rounded-lg group-hover:scale-105 transition-transform duration-200"
          />
          {image.caption && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default OptimizedImage;