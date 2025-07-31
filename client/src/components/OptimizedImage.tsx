import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  webpSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  webpSrc,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  quality = 85
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive sources
  const generateSrcSet = (baseSrc: string, isWebP = false) => {
    if (!width) return baseSrc;
    
    const extension = isWebP ? '.webp' : getFileExtension(baseSrc);
    const baseName = baseSrc.replace(/\.[^/.]+$/, '');
    
    const breakpoints = [480, 768, 1024, 1280, 1920];
    const srcSet = breakpoints
      .filter(bp => bp <= width * 2) // Only include relevant breakpoints
      .map(bp => {
        const scaledSrc = `${baseName}_${bp}w${extension}`;
        return `${scaledSrc} ${bp}w`;
      })
      .join(', ');
    
    return srcSet || baseSrc;
  };

  const getFileExtension = (filename: string) => {
    return filename.substring(filename.lastIndexOf('.'));
  };

  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Determine best source to use
  useEffect(() => {
    if (!isInView) return;

    const useWebP = webpSrc && supportsWebP();
    const finalSrc = useWebP ? webpSrc : src;
    
    // Add quality parameter if supported
    const urlWithQuality = finalSrc.includes('?') 
      ? `${finalSrc}&q=${quality}`
      : `${finalSrc}?q=${quality}`;
      
    setCurrentSrc(urlWithQuality);
  }, [isInView, src, webpSrc, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
    
    // Fallback to original src if WebP fails
    if (currentSrc === webpSrc) {
      setCurrentSrc(src);
    }
  };

  const getPlaceholderStyle = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return {
        backgroundImage: `url(${blurDataURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px)',
        transform: 'scale(1.1)'
      };
    }
    return {
      backgroundColor: '#f3f4f6'
    };
  };

  const containerStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={containerStyle}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <svg 
          className="w-8 h-8" 
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
    <div style={containerStyle} className="relative">
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${className}`}
          style={getPlaceholderStyle()}
        >
          {placeholder === 'empty' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}

      {/* Main Image */}
      {isInView && (
        <picture>
          {/* WebP source with responsive sizes */}
          {webpSrc && supportsWebP() && (
            <source
              type="image/webp"
              srcSet={generateSrcSet(webpSrc, true)}
              sizes={sizes}
            />
          )}
          
          {/* Fallback source with responsive sizes */}
          <source
            type={`image/${getFileExtension(src).slice(1)}`}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
          />
          
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>
      )}

      {/* Loading overlay */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}

// Utility function to create WebP version URLs
export function createWebPSrc(originalSrc: string): string {
  return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

// Utility function to create responsive image URLs
export function createResponsiveImageUrls(baseSrc: string, breakpoints: number[] = [480, 768, 1024, 1280, 1920]) {
  const extension = getFileExtension(baseSrc);
  const baseName = baseSrc.replace(/\.[^/.]+$/, '');
  
  return {
    webp: breakpoints.map(bp => ({
      url: `${baseName}_${bp}w.webp`,
      width: bp
    })),
    fallback: breakpoints.map(bp => ({
      url: `${baseName}_${bp}w${extension}`,
      width: bp
    }))
  };
}

function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.'));
}