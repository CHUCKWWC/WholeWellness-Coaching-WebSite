import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface StrengthRequirement {
  label: string;
  met: boolean;
  description: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    const requirements: StrengthRequirement[] = [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
        description: "Password should be 8 or more characters long"
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
        description: "Include at least one uppercase letter (A-Z)"
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password),
        description: "Include at least one lowercase letter (a-z)"
      },
      {
        label: "Contains a number",
        met: /[0-9]/.test(password),
        description: "Include at least one number (0-9)"
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        description: "Include at least one special character (!@#$%^&*)"
      }
    ];

    const metCount = requirements.filter(r => r.met).length;
    const percentage = (metCount / requirements.length) * 100;
    
    let level: "weak" | "fair" | "good" | "strong" = "weak";
    let color = "bg-red-500";
    let label = "Weak";
    
    if (metCount >= 5) {
      level = "strong";
      color = "bg-green-500";
      label = "Strong";
    } else if (metCount >= 4) {
      level = "good";
      color = "bg-blue-500";
      label = "Good";
    } else if (metCount >= 3) {
      level = "fair";
      color = "bg-yellow-500";
      label = "Fair";
    }

    return { requirements, metCount, percentage, level, color, label };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)} role="region" aria-label="Password strength indicator">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
          <span 
            className={cn(
              "font-medium",
              strength.level === "weak" && "text-red-600",
              strength.level === "fair" && "text-yellow-600",
              strength.level === "good" && "text-blue-600",
              strength.level === "strong" && "text-green-600"
            )}
            aria-live="polite"
          >
            {strength.label}
          </span>
        </div>
        <Progress 
          value={strength.percentage} 
          className="h-2"
          aria-label={`Password strength: ${strength.label}, ${strength.metCount} of ${strength.requirements.length} requirements met`}
        />
      </div>

      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.requirements.map((req, index) => (
          <li 
            key={index}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              req.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}
            aria-label={`${req.label}: ${req.met ? "requirement met" : "requirement not met"}`}
          >
            {req.met ? (
              <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>

      {strength.level === "weak" && password.length > 0 && (
        <div 
          className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Your password is too weak. Please add more complexity to secure your account.
          </p>
        </div>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
