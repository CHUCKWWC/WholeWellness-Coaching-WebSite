interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-8 w-8", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <svg 
        className={className} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
        <path 
          d="M20 8c-3.5 0-6.5 2.5-7.5 6 0 0-1 3 2 6 2 2 4.5 3 5.5 4.5 1-1.5 3.5-2.5 5.5-4.5 3-3 2-6 2-6-1-3.5-4-6-7.5-6z" 
          fill="white" 
          opacity="0.9"
        />
        <circle cx="20" cy="16" r="2.5" fill="white" />
        <path 
          d="M16 26c0 2 1.8 4 4 4s4-2 4-4-1.8-2-4-2-4 0-4 2z" 
          fill="white" 
          opacity="0.8"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className="text-xl font-bold text-primary">
          Whole Wellness Coaching
        </span>
      )}
    </div>
  );
}