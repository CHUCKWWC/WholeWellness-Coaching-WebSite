import { Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'wellness' | 'minimal';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  message,
  className 
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
    );
  }

  if (variant === 'wellness') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4 py-8", className)}>
        <div className="relative">
          <div className="animate-pulse">
            <Heart className={cn("text-pink-500", sizeClasses[size])} fill="currentColor" />
          </div>
          <div className="absolute inset-0 animate-ping">
            <Heart className={cn("text-pink-300", sizeClasses[size])} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {message || "Preparing your wellness journey..."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4 py-12", className)}>
      <div className="relative">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
      </div>
      {message && (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please wait while we load your content
          </p>
        </div>
      )}
      {!message && (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground mt-1">
            This will only take a moment
          </p>
        </div>
      )}
    </div>
  );
};

// Page-level loading component
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner 
      size="lg" 
      variant="wellness"
      message={message || "Loading page..."}
    />
  </div>
);

// Inline loading component
export const InlineLoader: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSpinner 
    size="sm" 
    variant="minimal"
    className={className}
  />
);

export default LoadingSpinner;