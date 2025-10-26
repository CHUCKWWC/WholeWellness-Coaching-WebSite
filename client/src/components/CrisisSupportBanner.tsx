import { useState, useEffect } from "react";
import { AlertCircle, Phone, X, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Crisis Support Banner
 *
 * Displays crisis hotline information for users who may need immediate help.
 * Designed for domestic violence survivors and those in mental health crisis.
 *
 * Features:
 * - Persistent but dismissible banner
 * - Direct links to National Domestic Violence Hotline and Crisis Text Line
 * - Trauma-informed design with calming colors
 * - Remembers dismissal state in sessionStorage (not localStorage for privacy)
 */

const CRISIS_RESOURCES = [
  {
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    href: "tel:1-800-799-7233",
    description: "24/7 confidential support",
    icon: Phone,
  },
  {
    name: "Crisis Text Line",
    text: "Text HOME to 741741",
    href: "sms:741741&body=HOME",
    description: "Free 24/7 crisis support via text",
    icon: AlertCircle,
  },
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    href: "tel:988",
    description: "24/7 free and confidential support",
    icon: Phone,
  },
];

export function CrisisSupportBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if user has dismissed the banner this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('crisis-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Use sessionStorage instead of localStorage for privacy
    // Banner will reappear in new session
    sessionStorage.setItem('crisis-banner-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-b border-teal-200 dark:border-teal-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert className="border-0 bg-transparent shadow-none my-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
              <div className="flex-1">
                <AlertDescription className="text-sm text-gray-800 dark:text-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="font-medium">
                      Need immediate help?
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {CRISIS_RESOURCES.slice(0, isExpanded ? CRISIS_RESOURCES.length : 1).map((resource, index) => (
                        <a
                          key={index}
                          href={resource.href}
                          className="inline-flex items-center gap-2 px-4 py-3 min-h-[48px] bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium transition-colors touch-target"
                          title={resource.description}
                          data-testid={`link-crisis-${resource.phone || resource.text}`}
                        >
                          <resource.icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{resource.name}:</span>
                          <span className="font-bold">{resource.phone || resource.text}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}

                      {!isExpanded && CRISIS_RESOURCES.length > 1 && (
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="inline-flex items-center px-3 py-3 min-h-[48px] text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline touch-target"
                          data-testid="button-expand-resources"
                        >
                          + {CRISIS_RESOURCES.length - 1} more resources
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        All resources are free, confidential, and available 24/7. You are not alone.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 min-h-[48px] min-w-[48px] touch-target"
              aria-label="Dismiss crisis support banner"
              data-testid="button-dismiss-crisis-banner"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
}
