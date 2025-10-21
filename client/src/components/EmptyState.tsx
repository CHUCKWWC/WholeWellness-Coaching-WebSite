import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  helpText?: string;
}

/**
 * EmptyState component provides clear guidance when there's no data
 * Shows icon, title, description, and actionable CTAs
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  helpText
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {primaryAction && (
          primaryAction.href ? (
            <Link href={primaryAction.href}>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="empty-state-primary-action"
              >
                {primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={primaryAction.onClick}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="empty-state-primary-action"
            >
              {primaryAction.label}
            </Button>
          )
        )}
        
        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <Button 
                variant="outline"
                data-testid="empty-state-secondary-action"
              >
                {secondaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline"
              onClick={secondaryAction.onClick}
              data-testid="empty-state-secondary-action"
            >
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
      
      {helpText && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4 max-w-sm">
          💡 {helpText}
        </p>
      )}
    </div>
  );
}
