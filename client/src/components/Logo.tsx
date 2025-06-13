import logoImage from "@assets/wwc_logo_1749818333586.jpg";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-8 w-8", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={logoImage}
        alt="Whole Wellness Coaching Logo"
        className={className}
        style={{ objectFit: 'contain' }}
      />
      {showText && (
        <span className="text-xl font-bold text-primary">
          Whole Wellness Coaching
        </span>
      )}
    </div>
  );
}